import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';

const config = {
    input: 'src/index.js',
    output: {
        file: 'index.js',
        format: 'iife',
        sourcemap: false
    },
    context: 'window',
    plugins: [
        resolve(),
        progress({
            clearLine: false
        }),
        filesize()
    ]
};

export default config;
