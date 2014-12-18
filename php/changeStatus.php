<?php
include_once('connectdb.php');

$order_id = $_POST['order_id'];
$new_status = $_POST['new_status'];

if ($new_status == 5) {
    $jquery_result_1 = mysql_query ("SELECT `order_status`, `pos` FROM `orders` WHERE `id` = '".$order_id."';");
    $row_with_order = mysql_fetch_array($jquery_result_1);
    $current_status = $row_with_order['order_status'];
    if ($current_status == 5) {
        return 0;
    } else {
        $jquery_result_2 = mysql_query ("SELECT `product_id`,`quantity` FROM `order_content` WHERE `order_id` =".$order_id.";");

        while ($row_with_content = mysql_fetch_assoc ($jquery_result_2)) {
            $current_product = array (
                "id"=>$row_with_content['product_id'],
                "quantity"=>$row_with_content['quantity']
            );

            $jquery_result_3 = mysql_query ("SELECT `component`, `quantity` FROM `recipes` WHERE `product` = ".$current_product['id'].";");

            while ($row_with_recipe = mysql_fetch_assoc($jquery_result_3)) {
                $current_component = array (
                    "ingredient"=>$row_with_recipe['component'],
                    "quantity"=>$row_with_recipe['quantity']
                );
                $quantity_to_subtract = $current_product['quantity']*$current_component['quantity'];
                $jquery_result_4 = mysql_query("UPDATE `actual_remains` SET `quantity` = `quantity` -"
                    .$quantity_to_subtract." WHERE `ingredient` =".$current_component['ingredient']." AND `shop` = "
                    .$row_with_order['pos']);
            }
        };
    }
}

$jquery_result_5 = mysql_query("UPDATE `orders` SET `order_status` = '".$new_status."' WHERE `id` = '".$order_id."';");

echo $jquery_result_5;