const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('inspector/checklist/wwwroot/js/ProductosServicios/ProductosServicios.js','utf8');
function extract(name) {
  const start = source.indexOf('    function '+name+'(');
  const end = source.indexOf('\n    function ', start+10);
  return source.slice(start,end);
}
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const state = {attributeRows:[
 {idProductoAtributo:id(10),idAtributo:id(1),valores:[{idAtributoValor:id(20),valor:'Negro'}]},
 {idProductoAtributo:'',idAtributo:id(1),valores:[{idAtributoValor:id(21),valor:'Rojo'}]},
 {idProductoAtributo:'',idAtributo:id(1),valores:[{idAtributoValor:id(20),valor:'Negro'}]},
 {idProductoAtributo:id(11),idAtributo:id(2),valores:[{idAtributoValor:id(22),valor:'Plastico'}]}
]};
const context=vm.createContext({state});
vm.runInContext(['normalizeGuid','normalizeCatalogCompareValue','buildAttributesPayload','buildVariantCombinations'].map(extract).join('\n'),context);
const payload=JSON.parse(JSON.stringify(vm.runInContext('buildAttributesPayload()',context)));
assert.equal(payload.length,2);
assert.deepEqual(payload[0].valores.map(x=>x.valor),['Negro','Rojo']);
assert.equal(payload[1].valores[0].valor,'Plastico');
context.options=[{nombre:'Tamaño',valores:['946 ml','5 L','QA Volumen A','QA Volumen B'].map(valor=>({valor}))}];
const combos=JSON.parse(JSON.stringify(vm.runInContext('buildVariantCombinations(options)',context)));
assert.equal(combos.length,4);
assert.equal(new Set(combos.map(x=>x.claveCombinacion)).size,4);
assert.deepEqual(combos.map(x=>x.nombre),['946 ml','5 L','QA Volumen A','QA Volumen B']);
console.log('PASS: atributo existente + elemento nuevo agrupados; par idéntico sin duplicar; otro atributo preservado.');
console.log('PASS: generador produce cuatro combinaciones distintas sin límite de dos. Prueba aislada, no persistencia real.');
