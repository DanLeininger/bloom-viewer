const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-touch-icon.png","favicon-16x16.png","favicon-96x96.png","favicon.ico","favicon.png","favicon.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.5eSR_y4y.js",app:"_app/immutable/entry/app.B-i5TJay.js",imports:["_app/immutable/entry/start.5eSR_y4y.js","_app/immutable/chunks/kaduXAdg.js","_app/immutable/chunks/BHtLyNKX.js","_app/immutable/chunks/ChBQ6wb0.js","_app/immutable/chunks/Cvg8IsPE.js","_app/immutable/chunks/y-p8HmmE.js","_app/immutable/chunks/HDAF0gzz.js","_app/immutable/entry/app.B-i5TJay.js","_app/immutable/chunks/ChBQ6wb0.js","_app/immutable/chunks/Cvg8IsPE.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/BHtLyNKX.js","_app/immutable/chunks/y-p8HmmE.js","_app/immutable/chunks/lmMq8u3N.js","_app/immutable/chunks/Ch83Ufs9.js","_app/immutable/chunks/CTHtwRlK.js","_app/immutable/chunks/DXsosdFf.js","_app/immutable/chunks/HDAF0gzz.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DIaGy5YV.js')),
			__memo(() => import('./chunks/1-DbLjtqFu.js')),
			__memo(() => import('./chunks/2-DeEvUuEZ.js')),
			__memo(() => import('./chunks/3-Co18Fj2Y.js')),
			__memo(() => import('./chunks/4-ReHC7AIf.js')),
			__memo(() => import('./chunks/5-HeM7AWpY.js')),
			__memo(() => import('./chunks/6-DyGpwL6f.js')),
			__memo(() => import('./chunks/7-CRZJszC8.js')),
			__memo(() => import('./chunks/8-rGVqbGbQ.js')),
			__memo(() => import('./chunks/9-B81Pct2C.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/cache/clear",
				pattern: /^\/api\/cache\/clear\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CL8xbCpJ.js'))
			},
			{
				id: "/api/evaluation/[...path]",
				pattern: /^\/api\/evaluation(?:\/([^]*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BkTsTs8m.js'))
			},
			{
				id: "/api/judgment/[...path]",
				pattern: /^\/api\/judgment(?:\/([^]*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-B7qaeROz.js'))
			},
			{
				id: "/api/transcripts",
				pattern: /^\/api\/transcripts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CNoomnI_.js'))
			},
			{
				id: "/api/transcripts/index",
				pattern: /^\/api\/transcripts\/index\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D2Tz1iyf.js'))
			},
			{
				id: "/api/transcripts/list",
				pattern: /^\/api\/transcripts\/list\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-YUepqcCd.js'))
			},
			{
				id: "/demo",
				pattern: /^\/demo\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/demo/message-rendering",
				pattern: /^\/demo\/message-rendering\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/demo/message-shortlist",
				pattern: /^\/demo\/message-shortlist\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/perf-test",
				pattern: /^\/perf-test\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/test-new-api",
				pattern: /^\/test-new-api\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/test-viewer",
				pattern: /^\/test-viewer\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/transcript/[...path]",
				pattern: /^\/transcript(?:\/([^]*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
