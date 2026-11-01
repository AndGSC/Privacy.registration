import { test } from "node:test";
import assert from "node:assert/strict";
import { maskEmail, maskName, maskPhone, maskIp } from "./masking.service";

// Correo
test("maskEmail deja la primera letra y el dominio", () => {
  assert.equal(maskEmail("andrey@gmail.com"), "a***@gmail.com");
});
test("maskEmail sin @ devuelve ***", () => {
  assert.equal(maskEmail("andreygmail.com"), "***");
});
test("maskEmail con dos @ devuelve ***", () => {
  assert.equal(maskEmail("a@b@c.com"), "***");
});

// Nombre
test("maskName deja la inicial de cada palabra", () => {
  assert.equal(maskName("Andrey Solís"), "A*** S***");
});
test("maskName con una sola palabra", () => {
  assert.equal(maskName("Andrey"), "A***");
});

// Teléfono
test("maskPhone deja los dos últimos dígitos", () => {
  assert.equal(maskPhone("8888-1234"), "******34");
});
test("maskPhone ignora espacios y guiones", () => {
  assert.equal(maskPhone("8888 1234"), "******34");
});

// IP
test("maskIp oculta el último número", () => {
  assert.equal(maskIp("192.168.1.25"), "192.168.1.***");
});
test("maskIp con IPv6 devuelve ***", () => {
  assert.equal(maskIp("2001:db8::1"), "***");
});

