<?php

require_once 'config.php';

$picId = $_GET['picId'];
if (empty ($picId)) error();

header('Content-type: image/jpg');
echo $ratings->findOne(['_id' => new MongoId($picId)], ['pic' => 1])['pic']->bin;