<?php
include_once('connectdb.php');

$login = $_POST['login'];
$pass = $_POST['password'];
$shop_id = $_POST['selectedShop'];
$page = $_SERVER['HTTP_REFERER'];


$res1 = mysql_query("SELECT `id`, `password`, `name`, `role` FROM `workers` WHERE `login`='".$login."';");
$row1 = mysql_fetch_array($res1);
$needed_password = $row1[1];
$worker = $row1[2];
$role = $row1[3];

if ($row1 && $needed_password===$pass) {
    if (strpos ($page, "admin")) {
        $aaa = "admin";

        if ($role == 1) {
            setcookie("workerId", $row1[0], 0, "/");
            echo "В розробці";
//            header ('Location: ../admin/admin.html');
        } else {
            echo "<script type='text/javascript'>alert('У вас немає прав адміністратора');</script>";
            linkBack($page);
        }

    } else {
        $aaa = "store";
        $res2 = mysql_query("SELECT `name` FROM `stores` WHERE `id`='".$shop_id."';");
        $row2 = mysql_fetch_array($res2);
        if ($row2) {
            setcookie("workerId", $row1[0]);
            setcookie("shopId", $shop_id);
            header('Location: ../store/workspace.html');
        } else {
            echo "<script type='text/javascript'>alert('Ви не обрали кав’ярню');</script>";
            linkBack($page);
        }

    }
} else {
    $aaa = "no login";
//    header('Location: '.$page);
    echo "<script type='text/javascript'>alert('Неправильний логін або пароль');</script>";
    linkBack($page);
}

function linkBack ($page){
    echo "<div style='text-align: center'><a href='".$page."'>Назад</a></div>";
}
?>
