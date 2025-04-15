<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $medidas = $_POST['medidas'];
    $material = $_POST['material'];

    // Calcular precio
    list($l, $a, $h) = explode('x', str_replace(' ', '', $medidas));
    $volumen = (float)$l * (float)$a * (float)$h;
    $precioBase = $material === 'PLA' ? 0.5 : 0.8;
    $precioTotal = $volumen * $precioBase;

    // Subir archivo
    $archivoNombre = basename($_FILES['archivo']['name']);
    $archivoTmp = $_FILES['archivo']['tmp_name'];
    $destino = __DIR__ . "/uploads/" . $archivoNombre;

    if (!is_dir('uploads')) {
        mkdir('uploads');
    }

    if (move_uploaded_file($archivoTmp, $destino)) {
        // Email al admin
        $mensaje = "Nuevo pedido:\n\nNombre: $nombre\nDescripción: $descripcion\nMedidas: $medidas\nMaterial: $material\nPrecio estimado: $$precioTotal\nArchivo: $archivoNombre";
        mail($admin_email, "Nuevo Pedido 3D", $mensaje);

        echo "✅ Pedido recibido correctamente. Precio estimado: $" . number_format($precioTotal, 2);
    } else {
        echo "❌ Error al subir el archivo.";
    }
}
?>
