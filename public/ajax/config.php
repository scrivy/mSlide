<?php

$m = new Mongo("mongodb://localhost");
$db = $m->mSlide;

$restaurants = $db->restaurants;
$ratings = $db->ratings;

function error()
{
	http_response_code(422);
	exit();
}