<?php
$host = "37.252.125.229";
$database="kavadrive";
$user = "remote";
$password = "kavadb00";

if(!mysql_connect($host,$user,$password))
    die('Не удалось подключиться к серверу MySql!');
elseif(!mysql_select_db($database))
    die('Не удалось выбрать БД!');

mysql_query('SET NAMES utf8');
?>