<?php

namespace __ROOTNS__\Builtins;

class StdOutLogFacility implements ILogFacility {
    /**
     * @param string $str
     */
    public function write(string $str) {
        echo $str;
    }

    /**
     *
     */
    public function flush() {
        #ifndef KittenPHP
        if (function_exists('flush')) {
            flush();
        }
        #endif
    }
}
