export default function () {
    return {
        vertexSrc: {
            uniform: {
                u_texOffset: 'vec2'
            },
            main: 'v_texAlphaCoord = v_texCoord + u_texOffset;'
        },
        fragmentSrc: {
            uniform: {
                u_tvEnabled: 'bool'
            },
            main: `
    if (u_tvEnabled) {
        alpha *= dot(lumcoeff, texture2D(u_source, v_texAlphaCoord).rgb);
    
        if (alpha < 0.04) {
            alpha = 0.0;
        }
        else if (alpha > 0.96) {
            alpha = 1.0;
        }
    }`
        },
        get disabled () {
            return !this.uniforms[0].data;
        },
        set disabled (b) {
            return this.uniforms[0].data[0] = +!b;
        },
        varying: {
            v_texAlphaCoord: 'vec2'
        },
        uniforms: [
            {
                name: 'u_tvEnabled',
                size: 1,
                type: 'i',
                data: [1]
            },
            {
                name: 'u_texOffset',
                size: 2,
                type: 'f',
                data: [0.0, -0.5]
            }
        ],
        attributes: [
            {
                name: 'a_texCoord',
                data: new Float32Array([
                    0.0, 0.5,
                    0.0, 1.0,
                    1.0, 0.5,
                    1.0, 1.0]),
                size: 2,
                type: 'FLOAT'
            }
        ]
    };
};
