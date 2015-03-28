<?php
include_once('connectdb.php');

$shopNumber = $_COOKIE ['shopId'];
$workerId = $_COOKIE ['workerId'];

$result1 = mysql_query ("   SELECT
								`orders`.*,
								`customers`.`phoneNumber`,
								`customers`.`mail`,
								`customers`.`firstName`,
								`customers`.`lastName`,
								`customers`.`identitySoc`
							FROM
								`orders`
							LEFT JOIN
								`customers` ON `customers`.`id` = `orders`.`customer`
							WHERE
								`orders`.`pos` =".$shopNumber."
							ORDER BY
								`orders`.`visit_time` DESC,
								`orders`.`id` DESC;"
);

$orders = array();

while($row_with_order = mysql_fetch_assoc($result1)){

    $result2 = mysql_query("SELECT workers.name
                            FROM order_history
                            INNER JOIN
                                (SELECT `order`, MAX(time) AS lastTime
                                FROM order_history
                                GROUP BY `order`) groupedHistory
                            ON order_history.`order` = groupedHistory.`order`
                            AND order_history.time = groupedHistory.lastTime
                            INNER JOIN workers ON order_history.worker = workers.id
                            WHERE order_history.`order` = ".$row_with_order['id'].";");

    $row2 = mysql_fetch_array($result2);
    $changeMaker = $row2['name'];

    $result3 =  mysql_query ("  SELECT
											`order_content`.`quantity`,
											`products`.`id`,
											`products`.`name`,
											`products`.`amount`,
											`products`.`price`
										FROM
										    `order_content`
                                        LEFT JOIN
										    `products` ON `products`.`id` = `order_content`.`product_id`
										WHERE
											`order_id` =".$row_with_order['id'].";"
    );

    $orderContent = array();

    while($row_with_content = mysql_fetch_assoc($result3)){
        $orderContent[] = array(
            "product_id"=>$row_with_content['id'],
            "itemName"=>$row_with_content['name'],
            "amount"=>$row_with_content['amount'],
            "price"=>$row_with_content['price'],
            "quantity"=>$row_with_content['quantity']
        );
    }

    $orders[] = array(
        "id"=>$row_with_order['id'],
        "firstName"=>$row_with_order['firstName'],
        "lastName"=>$row_with_order['lastName'],
        "identitySoc"=>$row_with_order['identitySoc'],
        "phoneNumber"=>$row_with_order['phoneNumber'],
        "mail"=>$row_with_order['mail'],
        "orderTime"=>$row_with_order['date'],
        "visitTime"=>$row_with_order['visit_time'],
        "sum"=>$row_with_order['sum'],
        "status"=>$row_with_order['order_status'],
        "pos"=>$shopNumber,
        "changeMaker"=>$changeMaker,
        "content"=>$orderContent
    );
}

$result4 = mysql_query("SELECT `name` FROM `stores` WHERE `stores`.`id` =".$shopNumber.";");
$row4 = mysql_fetch_array ($result4);
$shopName = $row4['name'];

$result5 = mysql_query("SELECT `name` FROM `workers` WHERE `id` =".$workerId.";");
$row5 = mysql_fetch_array ($result5);
$workerName = $row5['name'];

$dataToSend = array (
    'shop' => $shopName,
    'worker' => $workerName,
    'orders' => $orders
);

echo json_encode($dataToSend);