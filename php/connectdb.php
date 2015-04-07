<?php
$host = "localhost";
$database="kavadriv_kavadrive";
$user = "kavadriv_remote";
$password = "kavadb00";

if(!mysql_connect($host,$user,$password))
    die('Не удалось подключиться к серверу MySql!');
elseif(!mysql_select_db($database))
    die('Не удалось выбрать БД!');

mysql_query('SET NAMES utf8');
mysql_query("SET GLOBAL time_zone='CET'");
?>