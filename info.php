<?php
   phpinfo();
   print_r(function_exists('apcu_enabled'));
   print_r(apcu_enabled());
   print_r(apcu_cache_info());
?>