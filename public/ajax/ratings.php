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

}

function post()
{
	global $ratings;
	
	ignore_user_abort (true);
	$ratings->insert([
		'place_id' => $_POST['place_id'],
		'rating' => intval($_POST['rating']),
		'pic' => new MongoBinData(file_get_contents($_FILES['pic']['tmp_name']), MongoBinData::GENERIC)
	]);

	header("Location: http://" . $_SERVER['HTTP_HOST']);
}