<?php

namespace __ROOTNS__\Builtins;

interface ILogFacility {
    public function write(string $str);

    public function flush();
}
