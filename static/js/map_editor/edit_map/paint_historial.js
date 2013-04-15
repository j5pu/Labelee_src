// indica que se está pintando un trazo
var painting_trace = false;


// Indica bloques para el trazo que se está pintando. Por ejemplo, si se está
// pintando una traza con 3 bloques se contenido será:
//	[
//		{row: 50, col: 90, obj: 0},
//		{row: 51, col: 90, obj: 0},
//		{row: 52, col: 90, obj: 0}
//	]
var current_trace_blocks;


// Cada vez que se pinta en el grid, ya sea un único bloque o una traza
// con varios bloques, se guarda la información de esa 'pintada'.
// Por ejemplo, si se ha pintado un bloque y una traza vertical con 3 bloques,
// el contenido de esta variable será:
//	[
//		{row: 33, col: 47, obj: 1},
//		[
//			{row: 50, col: 90, obj: 0},
//			{row: 51, col: 90, obj: 0},
//			{row: 52, col: 90, obj: 0}
//		]
//	]
var paint_actions = [];


// indica la acción
var paint_action_pointer;