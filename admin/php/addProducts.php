<?php
    include_once('connectdb.php');
	$products = $_POST['products'];

	$mass = json_decode($products, true);
	foreach($mass as $key => $value){
        mysql_query ("UPDATE balanceOfGoods SET quantity = quantity + {$value['quantity']} WHERE ingredient = {$value['id']} AND shop = {$value['shop']}");     
    }
    $answer  = "����� ������� ������!";							
    echo json_encode($answer); 	  
?>