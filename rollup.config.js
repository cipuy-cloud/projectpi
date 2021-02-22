// memperkecil ukuran js
import {terser} from "rollup-plugin-terser"
// plugin buat javascript jadul ke modern
import commonjs from '@rollup/plugin-commonjs';
// masukin module lain ke bundle
import {nodeResolve} from "@rollup/plugin-node-resolve"
// plugin buat javascript modern
import {babel} from '@rollup/plugin-babel'
// plugin edit css
import postcss from "rollup-plugin-postcss"
// betulin css
import autoprefixer from "autoprefixer"

import url from "@rollup/plugin-url"


// check mode dalam pembuatan atau udah jadi
const production = !process.env.ROLLUP_WATCH;

export default {
    input: "src/main/web/index.js",
    output: {
        file: "build/bundle.js",
        format: "iife",
        sourcemap: true
    },
    plugins: [
        url(),
        postcss({
            plugins: [autoprefixer()]
        }),
        nodeResolve(),
        commonjs(),
        babel({
            babelHelpers: "bundled"
        }),
        production && terser()
    ]
}
