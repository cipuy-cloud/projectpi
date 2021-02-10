// memperkecil ukuran js
import {terser} from "rollup-plugin-terser"
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from "@rollup/plugin-node-resolve"
import {babel} from '@rollup/plugin-babel'

const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/index.js",
    output: {
        file: "public/bundle.js",
        format: "iife",
        sourcemap: true
    },
    plugins: [nodeResolve(), commonjs(), babel({babelHelpers: "bundled"}), production && terser()]
}
