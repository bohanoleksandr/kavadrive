<?php
include_once ('connectdb.php');

$username = $_POST['username'];
$password = $_POST['password'];
$page = $_POST['page'];

$result = mysql_query("SELECT `id`, `password`, `role` FROM `workers` WHERE `login`='".$username."';");
if(mysql_num_rows($result) == 0){
    echo 0;
} else{
    $worker_data = mysql_fetch_row($result);
    if ($worker_data[1] != $password) {
        echo 0;
    } else {
        if ($page == "store" || $worker_data[2] == 1) {
            setcookie("worker", $worker_data[0], 0, "/");
            echo 1;
        } else {
            echo -1;
        }
    }
};
