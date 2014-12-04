<?php

require_once 'public/ajax/config.php';

$restaurants->createIndex(['place_id' => 1], ['unique' => true]);
$restaurants->createIndex(['location' => '2dsphere']);

