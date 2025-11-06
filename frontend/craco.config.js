module.exports = {
	typescript: {
		enableTypeChecking: true,
	},
	webpack: {
		configure: (webpackConfig) => {
			// Exclude react-icons from source-map-loader to avoid ENOENT on non-existent index.mjs
			if (webpackConfig.module && Array.isArray(webpackConfig.module.rules)) {
				webpackConfig.module.rules.forEach((rule) => {
					if (rule && rule.oneOf && Array.isArray(rule.oneOf)) {
						rule.oneOf.forEach((one) => {
							if (one && one.use) {
								const uses = Array.isArray(one.use) ? one.use : [one.use];
								uses.forEach((u) => {
									if (u && u.loader && typeof u.loader === 'string' && u.loader.includes('source-map-loader')) {
										one.exclude = Array.isArray(one.exclude) ? one.exclude : (one.exclude ? [one.exclude] : []);
										one.exclude.push(/node_modules\/react-icons\/?.*/);
									}
								});
							}
						});
					}
				});
			}
			return webpackConfig;
		},
	},
};
