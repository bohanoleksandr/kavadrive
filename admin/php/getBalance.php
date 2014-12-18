<?php
    include_once('connectdb.php');

	$shopNumber = $_POST['shopNumber'];

	$result = mysql_query ("SELECT 
								balanceOfGoods.quantity,
								ingredient.name AS ingredient,
								ingredient.unit,
								ingredient.id,
								balanceOfGoods.shop
							FROM
								balanceOfGoods
									LEFT JOIN
								ingredient ON ingredient.id = balanceOfGoods.ingredient
							WHERE
								balanceOfGoods.shop = {$shopNumber}");	
	$balanceOfGoods = array();
	while($myrow = mysql_fetch_assoc($result)){
		$balanceOfGoods[] = array("ingredient"=>$myrow['ingredient'],"quantity"=>$myrow['quantity'],"unit"=>$myrow['unit'],"id"=>$myrow['id'],"shop"=>$myrow['shop']);
	}
	  echo json_encode($balanceOfGoods); 	 
?>