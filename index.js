(function () {
    'use strict';

    function alphaMask () {
        return {
            vertexSrc: {
                attribute: {
                    a_alphaMaskTexCoord: 'vec2'
                },
                main: `
    v_alphaMaskTexCoord = a_alphaMaskTexCoord;`
            },
            fragmentSrc: {
                uniform: {
                    u_alphaMaskEnabled: 'bool',
                    u_mask: 'sampler2D'
                },
                main: `
    if (u_alphaMaskEnabled) {
        alpha *= texture2D(u_mask, v_alphaMaskTexCoord).a;
    }`
            },
            get disabled () {
                return !this.uniforms[0].data;
            },
            set disabled (b) {
                return this.uniforms[0].data[0] = +!b;
            },
            varying: {
                v_alphaMaskTexCoord: 'vec2'
            },
            uniforms: [
                {
                    name: 'u_alphaMaskEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                {
                    name: 'u_mask',
                    size: 1,
                    type: 'i',
                    data: [1]
                }
            ],
            attributes: [
                {
                    name: 'a_alphaMaskTexCoord',
                    data: new Float32Array([
                        0.0, 0.0,
                        0.0, 1.0,
                        1.0, 0.0,
                        1.0, 1.0]),
                    size: 2,
                    type: 'FLOAT'
                }
            ],
            textures: [
                {
                    format: 'ALPHA'
                }
            ]
        };
    }

    function brightnessContrast () {
        return {
            vertexSrc: {},
            fragmentSrc: {
                uniform: {
                    u_brEnabled: 'bool',
                    u_ctEnabled: 'bool',
                    u_contrast: 'float',
                    u_brightness: 'float'
                },
                constant: 'const vec3 half3 = vec3(0.5);',
                main: `
    if (u_brEnabled) {
        color *= u_brightness;
    }

    if (u_ctEnabled) {
        color = (color - half3) * u_contrast + half3;
    }

    color = clamp(color, 0.0, 1.0);`
            },
            get brightness () {
                return this.uniforms[2].data[0];
            },
            set brightness (b) {
                this.uniforms[2].data[0] = parseFloat(Math.max(0, b));
            },
            get contrast () {
                return this.uniforms[3].data[0];
            },
            set contrast (c) {
                this.uniforms[3].data[0] = parseFloat(Math.max(0, c));
            },
            get brightnessDisabled () {
                return !this.uniforms[0].data;
            },
            set brightnessDisabled (b) {
                return this.uniforms[0].data[0] = +!b;
            },
            get contrastDisabled () {
                return !this.uniforms[1].data;
            },
            set contrastDisabled (b) {
                return this.uniforms[1].data[0] = +!b;
            },
            uniforms: [
                {
                    name: 'u_brEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                {
                    name: 'u_ctEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                /**
                 * 0.0 is completely black.
                 * 1.0 is no change.
                 *
                 * @min 0.0
                 * @default 1.0
                 */
                {
                    name: 'u_brightness',
                    size: 1,
                    type: 'f',
                    data: [1.0]
                },
                /**
                 * 0.0 is completely gray.
                 * 1.0 is no change.
                 *
                 * @min 0.0
                 * @default 1.0
                 */
                {
                    name: 'u_contrast',
                    size: 1,
                    type: 'f',
                    data: [1.0]
                }
            ]
        };
    }

    function hueSaturation () {
        return {
            vertexSrc: {
                uniform: {
                    u_hue: 'float',
                    u_saturation: 'float'
                },
                // for implementation see: https://www.w3.org/TR/SVG11/filters.html#feColorMatrixElement
                constant: `
const mat3 lummat = mat3(
    lumcoeff,
    lumcoeff,
    lumcoeff
);
const mat3 cosmat = mat3(
    vec3(0.787, -0.715, -0.072),
    vec3(-0.213, 0.285, -0.072),
    vec3(-0.213, -0.715, 0.928)
);
const mat3 sinmat = mat3(
    vec3(-0.213, -0.715, 0.928),
    vec3(0.143, 0.140, -0.283),
    vec3(-0.787, 0.715, 0.072)
);
const mat3 satmat = mat3(
    vec3(0.787, -0.715, -0.072),
    vec3(-0.213, 0.285, -0.072),
    vec3(-0.213, -0.715, 0.928)
);`,
                main: `
    float angle = (u_hue / 180.0) * 3.14159265358979323846264;
    v_hueRotation = lummat + cos(angle) * cosmat + sin(angle) * sinmat;
    v_saturation = lummat + satmat * u_saturation;`
            },
            fragmentSrc: {
                uniform: {
                    u_hueEnabled: 'bool',
                    u_satEnabled: 'bool',
                    u_hue: 'float',
                    u_saturation: 'float'
                },
                main: `
    if (u_hueEnabled) {
        color = vec3(
            dot(color, v_hueRotation[0]),
            dot(color, v_hueRotation[1]),
            dot(color, v_hueRotation[2])
        );
    }

    if (u_satEnabled) {
        color = vec3(
            dot(color, v_saturation[0]),
            dot(color, v_saturation[1]),
            dot(color, v_saturation[2])
        );
    }
    
    color = clamp(color, 0.0, 1.0);`
            },
            varying: {
                v_hueRotation: 'mat3',
                v_saturation: 'mat3'
            },

            get hue () {
                return this.uniforms[2].data[0];
            },
            set hue (h) {
                this.uniforms[2].data[0] = parseFloat(h);
            },
            get saturation () {
                return this.uniforms[3].data[0];
            },
            set saturation (s) {
                this.uniforms[3].data[0] = parseFloat(Math.max(0, s));
            },
            get hueDisabled () {
                return !this.uniforms[0].data;
            },
            set hueDisabled (b) {
                return this.uniforms[0].data[0] = +!b;
            },
            get saturationDisabled () {
                return !this.uniforms[1].data;
            },
            set saturationDisabled (b) {
                return this.uniforms[1].data[0] = +!b;
            },
            uniforms: [
                {
                    name: 'u_hueEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                {
                    name: 'u_satEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                /**
                 * 0.0 is no change.
                 * -180.0 is -180deg hue rotation.
                 * 180.0 is +180deg hue rotation.
                 *
                 * @min -180.0
                 * @max 180.0
                 * @default 0.0
                 */
                {
                    name: 'u_hue',
                    size: 1,
                    type: 'f',
                    data: [0.0]
                },
                /**
                 * 1.0 is no change.
                 * 0.0 is grayscale.
                 *
                 * @min 0.0
                 * @default 1.0
                 */
                {
                    name: 'u_saturation',
                    size: 1,
                    type: 'f',
                    data: [1.0]
                }
            ]
        };
    }

    function duotone () {
        return {
            vertexSrc: {},
            fragmentSrc: {
                uniform: {
                    u_duotoneEnabled: 'bool',
                    u_light: 'vec4',
                    u_dark: 'vec4'
                },
                main: `
    if (u_duotoneEnabled) {
        vec3 gray = vec3(dot(lumcoeff, color));
        color = mix(u_dark.rgb, u_light.rgb, gray);
    }`
            },
            get light () {
                return this.uniforms[1].data.slice(0);
            },
            set light (l) {
                l.forEach((c, i) => {
                    if ( ! Number.isNaN(c) ) {
                        this.uniforms[1].data[i] = c;
                    }
                });
            },
            get dark () {
                return this.uniforms[2].data.slice(0);
            },
            set dark (d) {
                d.forEach((c, i) => {
                    if ( ! Number.isNaN(c) ) {
                        this.uniforms[2].data[i] = c;
                    }
                });
            },
            get disabled () {
                return !this.uniforms[0].data;
            },
            set disabled (b) {
                return this.uniforms[0].data[0] = +!b;
            },
            uniforms: [
                {
                    name: 'u_duotoneEnabled',
                    size: 1,
                    type: 'i',
                    data: [1]
                },
                /**
                 * Light tone
                 */
                {
                    name: 'u_light',
                    size: 4,
                    type: 'f',
                    data: [0.9882352941, 0.7333333333, 0.05098039216, 1]
                },
                /**
                 * Dark tone
                 *
                 */
                {
                    name: 'u_dark',
                    size: 4,
                    type: 'f',
                    data: [0.7411764706, 0.0431372549, 0.568627451, 1]
                }
            ]
        };
    }

    var core = {
        init,
        draw,
        destroy,
        resize,
        getWebGLContext,
        createTexture
    };

    const vertexTemplate = ({
        uniform = '',
        attribute = '',
        varying = '',
        constant = '',
        main = ''
    }) => `
precision mediump float;
${uniform}
${attribute}
attribute vec2 a_texCoord;
attribute vec2 a_position;
${varying}
varying vec2 v_texCoord;

const vec3 lumcoeff = vec3(0.2125, 0.7154, 0.0721);
${constant}
void main() {
    v_texCoord = a_texCoord;
    ${main}
    gl_Position = vec4(a_position.xy, 0.0, 1.0);
}`;

    const fragmentTemplate = ({
        uniform = '',
        varying = '',
        constant = '',
        main = ''
    }) => `
precision mediump float;
${varying}
varying vec2 v_texCoord;
${uniform}
uniform sampler2D u_source;

const vec3 lumcoeff = vec3(0.2125, 0.7154, 0.0721);
${constant}
void main() {
    vec4 pixel = texture2D(u_source, v_texCoord);
    vec3 color = pixel.rgb;
    float alpha = pixel.a;
    ${main}
    gl_FragColor = vec4(color, 1.0) * alpha;
}`;

    /**
     * Initialize a compiled WebGLProgram for the given canvas and effects.
     *
     * @private
     * @param {WebGLRenderingContext} gl
     * @param effects
     * @param dimensions
     * @return {{gl: WebGLRenderingContext, data: kamposSceneData, [dimensions]: {width: number, height: number}}}
     */
    function init (gl, effects, dimensions) {

        const programData = _initProgram(gl, effects);

        return {gl, data: programData, dimensions: dimensions || {}};
    }

    /**
     * Get a webgl context for the given canvas element.
     *
     * @private
     * @param {HTMLCanvasElement} canvas
     * @return {WebGLRenderingContext}
     */
    function getWebGLContext (canvas) {
        let context;

        const config = {
            preserveDrawingBuffer: false, // should improve performance - https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-the-effort
            antialias: false, // should improve performance
            depth: false, // turn off for explicitness - and in some cases perf boost
            stencil: false // turn off for explicitness - and in some cases perf boost
        };

        context = canvas.getContext('webgl', config);

        if ( ! context ) {
            context = canvas.getContext('experimental-webgl', config);
        }

        return context;
    }

    /**
     * Resize the target canvas.
     *
     * @private
     * @param {WebGLRenderingContext} gl
     * @param {{width: number, height: number}} [dimensions]
     * @return {boolean}
     */
    function resize (gl, dimensions) {
        const canvas = gl.canvas;
        const realToCSSPixels = 1; //window.devicePixelRatio;
        const {width, height} = dimensions || {};
        let displayWidth, displayHeight;

        if ( width && height ) {
            displayWidth = width;
            displayHeight = height;
        }
        else {
            // Lookup the size the browser is displaying the canvas.
            displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels);
            displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);
        }

        // Check if the canvas is not the same size.
        if ( canvas.width !== displayWidth ||
             canvas.height !== displayHeight ) {

            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    /**
     * Draw a given scene
     *
     * @private
     * @param {WebGLRenderingContext} gl
     * @param {ArrayBufferView|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap} media
     * @param {kamposSceneData} data
     * @param {{width: number, height: number}} dimensions
     */
    function draw (gl, media, data, dimensions) {
        const {program, source, attributes, uniforms, textures} = data;

        // bind the source texture
        gl.bindTexture(gl.TEXTURE_2D, source.texture);

        // read source data into texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // set attribute buffers with data
        _enableVertexAttributes(gl, attributes);

        // set uniforms with data
        _setUniforms(gl, uniforms);

        if ( textures ) {
            for ( let i = -1; i < textures.length; i++ ) {
                gl.activeTexture(gl.TEXTURE0 + (i + 1));
                gl.bindTexture(gl.TEXTURE_2D, i === -1 ? source.texture : textures[i].texture);
            }
        }

        // Draw the rectangles
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Free all resources attached to a specific webgl context.
     *
     * @private
     * @param {WebGLRenderingContext} gl
     * @param {kamposSceneData} data
     */
    function destroy (gl, data) {
        const {program, vertexShader, fragmentShader, source, attributes} = data;

        // delete buffers
        (attributes || []).forEach(attr => gl.deleteBuffer(attr.buffer));

        // delete texture
        gl.deleteTexture(source.texture);

        // delete program
        gl.deleteProgram(program);

        // delete shaders
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }

    function _initProgram (gl, effects) {
        const source = {
            texture: createTexture(gl).texture,
            buffer: null
        };

        // flip Y axis for source texture
        gl.bindTexture(gl.TEXTURE_2D, source.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const data = _mergeEffectsData(effects);
        const vertexSrc = _stringifyShaderSrc(data.vertexSrc, vertexTemplate);
        const fragmentSrc = _stringifyShaderSrc(data.fragmentSrc, fragmentTemplate);

        // compile the GLSL program
        const {program, vertexShader, fragmentShader, error, type} = _getWebGLProgram(gl, vertexSrc, fragmentSrc);

        if ( error ) {
            throw new Error(`${type} error:: ${error}`);
        }

        // setup the vertex data
        const attributes = _initVertexAttributes(gl, program, data.attributes);

        // setup uniforms
        const uniforms = _initUniforms(gl, program, data.uniforms);

        return {
            program,
            vertexShader,
            fragmentShader,
            source,
            attributes,
            uniforms,
            textures: data.textures
        };
    }

    function _mergeEffectsData (effects) {
        return effects.reduce((result, config) => {
            const {attributes = [], uniforms = [], textures = [], varying = {}} = config;
            const merge = shader => Object.keys(config[shader]).forEach(key => {
                if ( key === 'constant' || key === 'main' ) {
                    result[shader][key] += config[shader][key] + '\n';
                }
                else {
                    result[shader][key] = {...result[shader][key], ...config[shader][key]};
                }
            });

            merge('vertexSrc');
            merge('fragmentSrc');

            attributes.forEach(attribute => {
                const found = result.attributes.some((attr, n) => {
                    if ( attr.name === attribute.name ) {
                        Object.assign(attr, attribute);
                        return  true;
                    }
                });

                if ( ! found ) {
                    result.attributes.push(attribute);
                }
            });

            result.uniforms.push(...uniforms);
            result.textures.push(...textures);

            Object.assign(result.vertexSrc.varying, varying);
            Object.assign(result.fragmentSrc.varying, varying);

            return result;
        }, {
            vertexSrc: {
                uniform: {},
                attribute: {},
                varying: {},
                constant: '',
                main: ''
            },
            fragmentSrc: {
                uniform: {},
                varying: {},
                constant: '',
                main: ''
            },
            /*
             * Default attributes
             */
            attributes: [
                {
                    name: 'a_position',
                    data: new Float32Array([
                        -1.0, -1.0,
                        -1.0, 1.0,
                        1.0, -1.0,
                        1.0, 1.0]),
                    size: 2,
                    type: 'FLOAT'
                },
                {
                    name: 'a_texCoord',
                    data: new Float32Array([
                        0.0, 0.0,
                        0.0, 1.0,
                        1.0, 0.0,
                        1.0, 1.0]),
                    size: 2,
                    type: 'FLOAT'
                }
            ],
            /*
             * Default uniforms
             */
            uniforms: [
                {
                    name: 'u_source',
                    size: 1,
                    type: 'i',
                    data: [0]
                }
            ],
            /*
             * Default textures
             */
            textures: []
        });
    }

    function _stringifyShaderSrc (data, template) {
        const templateData = Object.entries(data)
            .reduce((result, [key, value]) => {
                if ( ['uniform', 'attribute', 'varying'].includes(key) ) {
                    result[key] = Object.entries(value)
                        .reduce((str, [name, type]) =>
                            str + `${key} ${type} ${name};\n`,
                            ''
                        );
                }
                else {
                    result[key] = value;
                }

                return result;
            }, {});

        return template(templateData);
    }

    function _getWebGLProgram (gl, vertexSrc, fragmentSrc) {
        const vertexShader = _createShader(gl, gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = _createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

        if ( vertexShader.error ) {
            return vertexShader;
        }

        if ( fragmentShader.error ) {
            return fragmentShader;
        }

        return _createProgram(gl, vertexShader, fragmentShader);
    }

    function _createProgram (gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);

        if ( success ) {
            return {program, vertexShader, fragmentShader};
        }

        const exception = {
            error: gl.getProgramInfoLog(program),
            type: 'program'
        };

        gl.deleteProgram(program);

        return exception;
    }

    function _createShader (gl, type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

        if ( success ) {
            return shader;
        }

        const exception = {
            error: gl.getShaderInfoLog(shader),
            type: type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'
        };

        gl.deleteShader(shader);

        return exception;
    }

    /**
     * Create a WebGLTexture object.
     *
     * @private
     * @param {WebGLRenderingContext} gl
     * @param {number} width
     * @param {number} height
     * @param {ArrayBufferView|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap} data
     * @param {string} format
     * @return {{texture: WebGLTexture, width: number, height: number}}
     */
    function createTexture (gl, {width=1, height=1, data=null, format='RGBA'}={}) {
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        if ( data ) {
            // Upload the image into the texture
            gl.texImage2D(gl.TEXTURE_2D, 0,gl[format], gl[format], gl.UNSIGNED_BYTE, data);
        }
        else {
            // Create empty texture
            gl.texImage2D(gl.TEXTURE_2D, 0, gl[format], width, height, 0, gl[format], gl.UNSIGNED_BYTE, null);
        }

        return {texture, width, height};
    }

    function _createBuffer (gl, program, name, data) {
        const location = gl.getAttribLocation(program, name);
        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        return {location, buffer};
    }

    function _initVertexAttributes (gl, program, data) {
        return (data || []).map(attr => {
            const {location, buffer} = _createBuffer(gl, program, attr.name, attr.data);

            return {
                name: attr.name,
                location,
                buffer,
                type: attr.type,
                size: attr.size
            };
        });
    }

    function _initUniforms (gl, program, uniforms) {
        return (uniforms || []).map(uniform => {
            const location = gl.getUniformLocation(program, uniform.name);

            return {
                location,
                size: uniform.size,
                type: uniform.type,
                data: uniform.data
            };
        });
    }

    function _setUniforms (gl, uniformData) {
        (uniformData || []).forEach(uniform => {
            const {size, type, location, data} = uniform;

            gl[`uniform${size}${type}v`](location, data);
        });
    }

    function _enableVertexAttributes (gl, attributes) {
        (attributes || []).forEach(attrib => {
            const {location, buffer, size, type} = attrib;

            gl.enableVertexAttribArray(location);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(location, size, gl[type], false, 0, 0);
        });
    }

    /**
     * @private
     * @typedef {Object} kamposSceneData
     * @property {WebGLProgram} program
     * @property {WebGLShader} vertexShader
     * @property {WebGLShader} fragmentShader
     * @property {kamposTarget} source
     * @property {kamposAttribute[]} attributes
     *
     * @typedef {Object} kamposTarget
     * @property {WebGLTexture} texture
     * @property {WebGLFramebuffer|null} buffer
     * @property {number} [width]
     * @property {number} [height]
     *
     * @typedef {Object} kamposAttribute
     * @property {string} name
     * @property {GLint} location
     * @property {WebGLBuffer} buffer
     * @property {string} type
       @property {number} size
     */

    /**
     * Initialize a ticker instance for batching animation of multiple Kampos instances.
     *
     * @class Ticker
     */
    class Ticker {
        constructor () {
            this.pool = [];
        }

        /**
         * Starts the animation loop.
         */
        start () {
            if ( ! this.animationFrameId ) {
                const loop = () => {
                    this.animationFrameId = window.requestAnimationFrame(loop);
                    this.draw();
                };

                this.animationFrameId = window.requestAnimationFrame(loop);
            }
        }

        /**
         * Stops the animation loop.
         */
        stop () {
            window.cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        /**
         * Invoke draw() on all instances in the pool.
         */
        draw () {
            this.pool.forEach(instance => instance.draw());
        }

        /**
         * Add an instance to the pool.
         *
         * @param {Kampos} instance
         */
        add (instance) {
            const index = this.pool.indexOf(instance);

            if ( ! ~ index ) {
                this.pool.push(instance);
            }
        }

        /**
         * Remove an instance form the pool.
         *
         * @param {Kampos} instance
         */
        remove (instance) {
            const index = this.pool.indexOf(instance);

            if ( ~ index ) {
                this.pool.splice(index, 1);
            }
        }
    }

    /**
     * Initialize a webgl target with effects.
     *
     * @class Kampos
     * @param {kamposConfig} config
     */
    class Kampos {
        /**
         * @constructor
         */
        constructor (config) {
            this.init(config);

            this._restoreContext = (e) => {
                e && e.preventDefault();
                this.config.target.removeEventListener('webglcontextrestored', this._restoreContext, true);

                this.init();

                if ( this._source ) {
                    this.setSource(this._source);
                }

                delete this._source;

                if (config && config.onContextRestored) {
                    config.onContextRestored.call(this, config);
                }
            };

            this._loseContext = (e) => {
                e.preventDefault();

                if (this.gl && this.gl.isContextLost()) {

                    this.lostContext = true;

                    this.config.target.addEventListener('webglcontextrestored', this._restoreContext, true);

                    this.destroy(true);

                    if (config && config.onContextLost) {
                        config.onContextLost.call(this, config);
                    }
                }
            };

            this.config.target.addEventListener('webglcontextlost', this._loseContext, true);
        }

        /**
         * Initializes an Kampos instance.
         * This is called inside the constructor,
         * but can be called again after effects have changed
         * or after {@link Kampos#desotry()}.
         *
         * @param {kamposConfig} [config] defaults to `this.config`
         */
        init (config) {
            config = config || this.config;
            let {target, effects, ticker} = config;

            this.lostContext = false;

            let gl = core.getWebGLContext(target);

            if (gl.isContextLost()) {
                this.restoreContext();
                // get new context from the fresh clone
                gl = core.getWebGLContext(this.config.target);
            }

            const {data} = core.init(gl, effects, this.dimensions);

            this.gl = gl;
            this.data = data;

            // cache for restoring context
            this.config = config;

            if ( ticker ) {
                this.ticker = ticker;
                ticker.add(this);
            }
        }

        /**
         * Set the source config.
         *
         * @param {ArrayBufferView|ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap|kamposSource} source
         */
        setSource (source) {
            if ( ! source ) return;

            if ( this.lostContext ) {
                this.restoreContext();
            }

            let media, width, height;

            if ( Object.prototype.toString.call(source) === '[object Object]' ) {
                ({media, width, height} = source);
            }
            else {
                media = source;
            }

            if ( width && height ) {
                this.dimensions = { width, height };
            }

            // resize the target canvas if needed
            core.resize(this.gl, this.dimensions);

            this._createTextures();

            this.media = media;
        }

        /**
         * Draw current scene.
         */
        draw () {
            if ( this.lostContext ) {
                this.restoreContext();
            }

            core.draw(this.gl, this.media, this.data, this.dimensions);
        }

        /**
         * Starts the animation loop.
         */
        play () {
            if ( this.ticker ) {
                if ( this.animationFrameId ) {
                    this.stop();
                }

                if ( ! this.playing ) {
                    this.playing = true;
                    this.ticker.add(this);
                }
            }
            else if ( ! this.animationFrameId ) {
                const loop = () => {
                    this.animationFrameId = window.requestAnimationFrame(loop);
                    this.draw();
                };

                this.animationFrameId = window.requestAnimationFrame(loop);
            }

        }

        /**
         * Stops the animation loop.
         */
        stop () {
            if ( this.animationFrameId ) {
                window.cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            if ( this.playing ) {
                this.playing = false;
                this.ticker.remove(this);
            }
        }

        /**
         * Stops animation loop and frees all resources.
         *
         * @param {boolean} keepState  for internal use.
         */
        destroy (keepState) {
            this.stop();

            if ( this.gl && this.data ) {
                core.destroy(this.gl, this.data);
            }

            if ( keepState ) {
                const dims = this.dimensions || {};

                this._source = this._source || {
                    media: this.media,
                    width: dims.width,
                    height: dims.height
                };
            }
            else {
                this.config.target.removeEventListener('webglcontextlost', this._loseContext, true);

                this.config = null;
                this.dimensions = null;

            }

            this.gl = null;
            this.data = null;
            this.media = null;
        }

        /**
         * Restore a lost WebGL context fot the given target.
         * This will replace canvas DOM element with a fresh clone.
         */
        restoreContext () {
            const canvas = this.config.target;
            const clone = this.config.target.cloneNode(true);
            const parent = canvas.parentNode;

            if ( parent ) {
                parent.replaceChild(clone, canvas);
            }

            this.config.target = clone;

            canvas.removeEventListener('webglcontextlost', this._loseContext, true);
            canvas.removeEventListener('webglcontextrestored', this._restoreContext, true);
            clone.addEventListener('webglcontextlost', this._loseContext, true);

            if (this.lostContext) {
                this._restoreContext();
            }
        }

        _createTextures () {
            this.data && this.data.textures.forEach((texture, i) => {
                this.data.textures[i].texture = core.createTexture(this.gl, {
                    width: this.dimensions.width,
                    height: this.dimensions.height,
                    format: texture.format,
                    data: texture.image
                }).texture;
            });
        }
    }

    var KAMPOS = {
        effects: {
            alphaMask,
            brightnessContrast,
            hueSaturation,
            duotone
        },
        Kampos,
        Ticker
    };

    function transparentVideo () {
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
    }

    const {Kampos: Kampos$1} = KAMPOS;
    const target = document.querySelector('#target');
    const media = document.querySelector('#video');
    const body = document.body;
    const fx = [transparentVideo()];
    const kampos = new Kampos$1({target, effects: fx});

    const MAX_WIDTH = 854;
    let fxEnabled = true;

    const fxToggle = document.querySelector('#fx-toggle');
    const backgroundInput = document.querySelector('#background-color');
    const videoSection = document.querySelector('#video-sec');
    const urlInput = document.querySelector('#video-src');
    const fileInput = document.querySelector('#file-src');
    const videoGo = document.querySelector('#video-go');
    const playButton = document.querySelector('#play-button');

    function draw$1 () {
        const width = Math.min(MAX_WIDTH, media.videoWidth);
        const height = media.videoHeight / 2 / media.videoWidth * width;

        kampos.setSource({media, width, height});

        kampos.draw();
    }

    function play () {
        media.play();

        const width = Math.min(MAX_WIDTH, media.videoWidth);
        const height = media.videoHeight / 2 / media.videoWidth * width;

        kampos.setSource({media, width, height});

        kampos.play();

        videoSection.classList.add('pausable');
        videoSection.addEventListener('click', videoPause, {once: true});

        (fxEnabled ? target : media).classList.remove('hide');
    }

    function togglePlay (show) {
        playButton.classList.toggle('hide', !show);
    }

    function canPlay () {
        togglePlay(true);
        draw$1();
    }

    function videoPause () {
        if (!media.paused) {
            videoSection.classList.remove('pausable');
            media.pause();
            kampos.stop();
            togglePlay(true);
        }
    }

    function changeSrc (src, ext, cb) {
        kampos.stop();

        (fxEnabled ? target : media).classList.add('hide');

        media.firstElementChild.setAttribute('src', src);

        let type = 'video/';

        switch (ext) {
            case 'mov':
                type += 'quicktime';
                break;
            case 'mp4':
            default:
                type += ext;
        }

        media.firstElementChild.setAttribute('type', type);

        media.load();

        media.addEventListener('canplay', canPlay, {once: true});

        if (cb) {
            media.addEventListener('canplaythrough', cb, {once: true});
        }
    }

    media.addEventListener('canplay', canPlay, {once: true});

    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        play();
        togglePlay(false);
    });

    fxToggle.addEventListener('change', e => {
        fxEnabled = e.target.checked;

        media.classList.toggle('hide', fxEnabled);
        target.classList.toggle('hide', !fxEnabled);
    });

    backgroundInput.addEventListener('change', e => {
        document.body.style.backgroundColor = e.target.value;
    });

    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);

        changeSrc(url, file.name.split('.').reverse()[0], () => {
            URL.revokeObjectURL(url);
        });
    });

    videoGo.addEventListener('click', () => {
        changeSrc(urlInput.value, urlInput.value.split('.').reverse()[0]);
    });

    function drop (e) {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        const url = URL.createObjectURL(file);

        changeSrc(url, file.name.split('.').reverse()[0], () => {
            URL.revokeObjectURL(url);
        });
    }

    body.addEventListener('dragenter', e => e.preventDefault(), false);
    body.addEventListener('dragover', e => e.preventDefault(), false);
    body.addEventListener('drop', drop, false);

}());
