import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// /** @type {import('vite').Plugin} */
// const viteServerConfig = {
// 	name: 'log-request-middleware',
// 	configureServer(server) {
// 		server.middlewares.use((req, res, next) => {
// 			res.setHeader('Access-Control-Allow-Origin', '*');
// 			res.setHeader('Access-Control-Allow-Methods', 'GET');
// 			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
// 			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
// 			next();
// 		});
// 	}
// };

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		}),
		nodePolyfills({
			include: ['stream', 'util', 'events', 'http', 'https', 'cypto']
		}),
	],
	server: {
		// 你可能已经有其他 server 配置，比如 proxy
		// ...
		// 这是你需要添加或修改的关键部分
		fs: {
			// `allow` 是一个目录名数组，Vite 被允许从这些目录提供文件。
			// OpenWebUI 的配置里可能已经有 'search-adapter'，
			// 你只需要把 'external' 加到这个数组里。
			allow: ['search-adapter', 'external'] 
		},
		proxy: {
		// 这里的 '/attestation-api' 是一个自定义的“暗号”
		// 浏览器看到以它开头的请求，就会交给 Vite 代理
			'/attestation-api': {
				target: 'https://confidentialcomputing-dev.aizelnetwork.com',
				changeOrigin: true, // 这个非常重要，必须为 true
				secure: false, // 如果目标是 https，有时需要这个
				rewrite: (path) => path.replace(/^\/attestation-api/, ''), // 去掉“暗号”，换成真实路径
			}
		}
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true
	},
	worker: {
		format: 'es'
	}
});
