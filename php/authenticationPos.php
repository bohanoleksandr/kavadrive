<?php
include_once('connectdb.php');

$login = $_POST['login'];
$pass = $_POST['password'];
$shop_id = $_POST['selectedShop'];
$shop_name = null;
//$role = $_POST['role'];
$page = $_SERVER['HTTP_REFERER'];

$res1 = mysql_query("SELECT `name` FROM `stores` WHERE `id`='".$shop_id."';");
$row1 = mysql_fetch_row($res1);
$shop_name = $row1[0];

$res2 = mysql_query("SELECT `id`, `password`, `name`, `role` FROM `workers` WHERE `login`='".$login."';");
$row2 = mysql_fetch_row($res2);
$needed_password = $row2[1];
$worker = $row2[2];

if ($res2){
//    $info['shop_id'] = $shop_id;
//    $info['shop_name'] = $shop_name;
//    $info['worker'] = $worker;
    if($needed_password === $pass  && $shop_name){
        setcookie("workerId", $row2[0]);
        setcookie("shopId", $shop_id);
        header('Location: ../store/workspace.html');
    } else {
        header('Location: '.$page);
    }
}

?>