<?php

require_once 'config.php';

switch ($_SERVER['REQUEST_METHOD']) {
	case 'GET':
		get();
		break;
	case 'POST':
		post();
		break;
	default:
		error();
		break;
}

function get()
{
	global $restaurants;
	global $ratings;

	$placeId = $_GET['place_id'];
	if (empty ($placeId)) error();

	$count = $restaurants->count(['place_id' => $placeId]);

	if ($count === 0) {
		echo json_encode([
			'data' => NULL
		]);
	} else {
		$pics = $ratings->find(['place_id' => $placeId], ['_id' => 1]);

		$ids = [];

		foreach ($pics as $id => $pic)
		{
			$ids[] = $id;
		}

		echo json_encode([
			'data' => $ids
		]);
	}
}

function post()
{
	ignore_user_abort (true);
	global $restaurants;

	if (empty ($_POST['data'])) error();

	$place = json_decode($_POST['data']);
	$restaurants->insert($place);
}