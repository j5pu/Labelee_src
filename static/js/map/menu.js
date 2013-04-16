// $(document).on('ready', main);


var lista = [
	"Kinepolis",
	"McDonalds",
	"Seat",
	"Zara"
];


if(algoRecordado()) insertarRecordado();

var capa;

// function main()
// {
// 	mostrarLista();
// }

function mostrarLista()
{
	capa = document.getElementById("listaDrop");
	capa.innerHTML='';
	for (var i=0;i<lista.length;i++){
		addElement(lista[i]);
	}
}


function insertarRecordado()
{
	// Inserta el lugar al principio del array

	lista.unshift(0);
	lista[0] = localStorage['recordado'];
}


function addElement(texto){

	var li = document.createElement("li");
	li.innerHTML = "<a href=http://www."+texto+".com>"+texto+"</a>";
	capa.appendChild(li);
}

function Recordar() {
	var lugar = prompt("Introduzca el nombre de la localización a recordar","");

	for (var i=0;i<lista.length;i++)
		if (lugar.toUpperCase() == lista[i].toUpperCase()) {
			alert("Ya existe una entrada con ese nombre");
			return;
		}

	lugar = lugar[0].toUpperCase() + lugar.slice(1);
    localStorage['recordado']= lugar;
    if(!algoRecordado)
		insertarRecordado();
    else
		lista[0] = lugar;

	mostrarLista();
}


function algoRecordado()
{
	return !(typeof localStorage["recordado"] === 'undefined'|| localStorage["recordado"] === '');
}


function Buscar(){
	var a_buscar = document.getElementById("busqueda").value;
	for (var i=0;i<lista.length;i++){
		if (a_buscar.toUpperCase() == lista[i].toUpperCase()) {
			window.location = "http://www."+a_buscar+".com";
			alert('Redirigiendo...');
			return;
		}
	}
	alert('El elemento buscado no se encuentra en el directorio');
}
