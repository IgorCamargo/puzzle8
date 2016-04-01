// código modificado para melhor entendimento a partir: http://henriquevianna.com/code/ia/8puzzle.html
var meta =[	["1","2","3"],
            ["4","5","6"],
            ["7","8","9"] ];											// estado objetivo, puzzle montado

var estado = copiaEstado(meta);											// estado do tabuleiro na tela - inicializa com o estado meta
var ultimo = copiaEstado(meta);											// guarda o estado antes da solução
var movimentos = 0;														// movimentos realizados pelo jogador (humano)

var pilha = [];															// array de objetos tipo nodo
var fechados = [];														// array dos nodos já avaliados
var nodos = 0;															// quantidade de nodos visitados
var profundMax = 30;													// profundidade máxima a explorar na árvore - evita cair em ramos infinitos na busca cega
var solucao = [];														// array que conterá a seqüência de nodos até a solução
var tempoInicio;														// para cálculo do tempo transcorrido na busca


// seleciona o método e inicia a busca
function buscaSolucao(alg) {											// passa como parametro 'A2', que corresponde ao algoritmo A*
	var modo = alg;
	if (!modo)
		return;															// verifica se o método for nulo
	
	ultimo = copiaEstado(estado);										// salva o estado atual do tabuleiro
	desativaBotoes();
	tempoInicio = new Date().getTime();
	pilha = [];
	fechados = [];
	solucao = [];
	nodos = 0;
	movimentos = 0;														// zera movimentos feitos pelo jogador
  
	if (modo[0] == "A") {												// heurísticas do A*
		var nodo = {estado: estado, profundidade: 0, pai: null, valorf: 0, valorg: 0, valorh: 0};
// valorh = valor da heristica
// valorg = valor gerado
// valorf = valor final
		nodo.valorh = calculaHeuristica(estado,modo);					// nodo.valorh recebe o cálculo da heurística A* - Manhattan Distance
		nodo.valorf = nodo.valorh;
		pilha.push(nodo);												// adiciona na pilha o nodo avaliado
		document.getElementById("aprofund").innerHTML = profundMax;
		iteracaoBusca(modo,profundMax);									// retorna a busca na árvore do "melhor caminho"
	}
}


// função que faz a busca na árvore, de acordo com o método selecionado, neste caso A*
function iteracaoBusca(modo,pmax) {
	var nodo = {};
	var profundidade, i;
  
	while (pilha.length) {
		document.getElementById("tampilha").innerHTML = pilha.length;	// exibe tamanho da pilha/fila
		if (modo[0] == "A") 											// A*
			nodo = pilha.shift();										// remove do inicio, funciona como fila
		// else							// Busca em Profundidade ou Aprofundamento Iterativo
		// 	nodo = pilha.pop();	// remove do fim, funciona como pilha
		nodos++;
		if (modo[0] == "A")												// A*
			fechados.push(nodo);										// coloca nodo na lista de nodos já avaliados

		estado = nodo.estado;
		profundidade = nodo.profundidade;
		document.getElementById("profundidade").innerHTML = profundidade;
		document.getElementById("nodos").innerHTML = nodos;

		if (comparaEstados(estado,meta)) {								// compara se o estado do tabuleiro já atingiu a meta
			calculaTempo();
			alert("SOLUÇÃO ENCONTRADA!\n\nClique OK para aprender :P");
			solucao.push(nodo.estado);									// reconstrói o caminho até o estado inicial
			while (nodo.pai) {
				nodo = nodo.pai;
				solucao.push(nodo.estado);
			}
			estado = solucao.pop();										// retira o último estado empilhado (estado inicial)
			exibeEstado(estado);										// volta o tabuleiro ao estado inicial
			document.getElementById("solucao").style.display = '';		// exibe dados da solução
			document.getElementById("solucaoBotao").style.display = '';
			return;
		}
		else {															// se não se atingiu a meta
			if (profundidade < pmax)									// verifica se a profundidade não ultrapassou o limite de 30 (profundMax = 30)
				geraFilhos(nodo,profundidade,modo);						// e se não ultrapassou, gera filhos
		}
	}
	ativaBotoes();
}


// gera os filhos de um nodo
function geraFilhos(nodo,profundidade,modo) {
	profundidade++;
	
	for (var i=0; i<3; i++)
		for (var j=0; j<3; j++) 
			if (nodo.estado[i][j] == "9") {								// localiza o espaço em branco
// gera os filhos possíveis e coloca na pilha
				if (i > 0)
					empilhaFilho(nodo,profundidade,modo,i,j,i-1,j);		// move o branco para cima
				if (i < 2)
					empilhaFilho(nodo,profundidade,modo,i,j,i+1,j);		// move o branco para baixo
				if (j > 0)
					empilhaFilho(nodo,profundidade,modo,i,j,i,j-1);		// move o branco para a esquerda
				if (j < 2)
					empilhaFilho(nodo,profundidade,modo,i,j,i,j+1);		// move o branco para a direita

				return; // encerra, nao precisa terminar os loops
			}
}


// cria nodo e adiciona-o à fila/pilha
function empilhaFilho(pai,profundidade,modo,io,jo,id,jd) {
	var filho, estado, valorg, valorf, valorh, i;

	estado = copiaEstado(pai.estado);
	trocaPeca(estado,io,jo,id,jd);

	if (modo[0] == "A") {												// A*
		if (procuraLista(fechados,estado))
			return;														// se já está na lista de nodos analisados, sai sem fazer nada
		valorg = pai.valorg + 1;
		valorh = calculaHeuristica(estado,modo);						// calcula a herística do estado do nodo
		valorf = valorg + valorh;
		filho = {estado: estado, profundidade: profundidade, pai: pai, valorf: valorf, valorg: valorg, valorh: valorh};
		i = procuraLista(pilha,estado);									// se estado já existe na lista de abertos, retorna indice do nodo correspondente
		if (i != null) {
			if (pilha[i].valorg <= valorg)								// compara se a heuristica do estado do nodo pai é melhor ou igual à do estado do nodo filho
				return;													// sai sem colocar o filho gerado na lista
			else
				pilha.splice(i,1);										// remove o nodo antigo da lista
		}
		insereFilaPrioridade(filho);									// adiciona o filho gerado à fila de prioridade
	}
}


// função heurística utilizada pelo A*
function calculaHeuristica(estado,modo) {
	var x,y,n,d,py,px;

	n = 0;
	for (y=0; y<3; y++)
		for(x=0; x<3; x++) {
			if (estado[y][x] != meta[y][x] && estado[y][x] != "9") {
// verifica peças fora do lugar, sem contar o espaço em branco
// dado que y é a linha e x é a coluna
				if (modo == "A2") {										// calcula distância total das peças de suas posições corretas
					py = parseInt((estado[y][x]-1)/3);					// py recebe a linha correta da peça avaliada, conforme o seu valor
					px = estado[y][x]-py*3-1;							// py recebe a coluna correta da peça avaliada, conforme o seu valor
					d = Math.abs(x-px) + Math.abs(y-py);				// d recebe a quantidade de movimentos (distância) até sua posição da meta - Manhattan Distance
// math.abs - retorna o valor sempre positivo
					n += d;												// n acumula a soma da distância das peças
				}
				else {
					alert("Erro na chamada - heurística inválida!");
					exit;
				}
			}
		}
				
	return n;
}

// exibe um passo da solução
function exibeSolucao() {
	if (solucao.length) {
		estado = solucao.pop();
		movimentos++;
		exibeEstado(estado);
		document.getElementById("movimentos").innerHTML = movimentos;
	}
	if (!solucao.length) {
		document.getElementById("solucaoBotao").style.display = 'none';	// oculta botão para ver a solução
		movimentos = 0;													// reseta contador de movimentos do jogador (mas não mostra na tela até que seja feita uma jogada)
		ativaBotoes();
	}
}

// embaralha tabuleiro
function embaralhaTabuleiro(estado,n,ultimo) {
	var i,j,r,moveu;

	desativaBotoes();
	if (n) {
		loops:
		for (var i=0; i<3; i++)
			for (var j=0; j<3; j++)
				if (estado[i][j] == "9")								// localiza o espaço em branco
					break loops;										// sai dos loops com o valor correto de i e j

		moveu = false;
		while (!moveu) {
			r = Math.floor(Math.random()*4);							// escolhe um movimento aleatório
			switch(r) {
				case 0:
					if (i > 0 && ultimo != "b") {						// testa se pode mover para cima
						trocaPeca(estado,i,j,i-1,j);
						ultimo = "c";
						moveu = true;
					}
					break;
				case 1:
					if (i < 2 && ultimo != "c") {						// testa se pode mover para baixo
						trocaPeca(estado,i,j,i+1,j);
						ultimo = "b";
						moveu = true;
					}
					break;
				case 2:
					if (j > 0 && ultimo != "d") {						// testa se pode mover para a esquerda
						trocaPeca(estado,i,j,i,j-1);
						ultimo = "e";
						moveu = true;
					}
					break;
				case 3:
					if (j < 2 && ultimo != "e") {						// testa se pode mover para a direita
						trocaPeca(estado,i,j,i,j+1);
						ultimo = "d";
						moveu = true;
					}
			}
		}

		exibeEstado(estado);
		n--;
		window.setTimeout(function() { embaralhaTabuleiro(estado,n,ultimo) },100);  // nova iteração em 100ms
	}
	else {
		movimentos = 0;													// reseta os movimentos do jogador, pois o tabuleiro foi modificado
		ativaBotoes();
	}
}


// movimento do jogador (humano)
function movePeca(elemento) {
	var i = Number(elemento.id.substr(1,1));							// pega linha a partir da id do elemento (ex. "p02")
	var j = Number(elemento.id.substr(2,1));							// pega coluna a partir da id do elemento
	var novoi = i, novoj = j;

// testa em qual direção a peça escolhida pode ser movida 
// o valor "9" indica o espaço em branco
	if (i > 0 && estado[i-1][j] == "9")
		novoi = i-1;
	else if (i < 2 && estado[i+1][j] == "9")
		novoi = i+1;
	else if (j > 0 && estado[i][j-1] == "9")
		novoj = j-1;
	else if (j < 2 && estado[i][j+1] == "9")
		novoj = j+1;

	if (novoi == i && novoj == j)
		alert("Impossível mover peça "+estado[i][j]);
	else {
		trocaPeca(estado,i,j,novoi,novoj);
		movimentos++;
		document.getElementById("movimentos").innerHTML = movimentos;
		exibeEstado(estado);
		if (comparaEstados(estado,meta)) {
			alert("Resolvido em "+movimentos+" movimentos. Parabéns!");
			movimentos = 0;
		}
	}
}


/* funções auxiliares */

function trocaPeca(estado,oi,oj,di,dj) {
	var t = estado[di][dj];
	estado[di][dj] = estado[oi][oj];
	estado[oi][oj] = t;
}

function insereFilaPrioridade(nodo) {									// insere na fila, ordenado pelo valor f do nodo

	var i = 0;
	var html = "";

	while (i < pilha.length && parseInt(nodo.valorf) > parseInt(pilha[i].valorf))
		i++;
	if (i >= pilha.length)
		pilha.push(nodo);												// insere no fim
	else
		pilha.splice(i,0,nodo);											// insere na posição i
}

function procuraLista(lista,estado) {									// procura se estado já foi avaliado
	for (var i=0; i < lista.length; i++)
		if (comparaEstados(estado,lista[i].estado))
			return i;
}

function exibeEstado(estado) {											// exibe estado na tela
	for (var i=0; i<3; i++)
		for (var j=0; j<3; j++) {
			elemento = document.getElementById("p"+i+j);
			elemento.className = "c"+estado[i][j];
			elemento.innerHTML = estado[i][j];
		}
}

function copiaEstado(estado) {											// retorna uma cópia do estado
	var retorno = [];
	for (var i = 0; i < estado.length; i++)								// copia elementos do array
		retorno[i] = estado[i].slice(0);								// necessário para evitar a cópia por referência

	return retorno;
}

function comparaEstados(estado1,estado2) {								// compara estados
	for (var i=0; i<3; i++)
		for (var j=0; j<3; j++)
			if (estado1[i][j] != estado2[i][j])
				return false;

	return true;
}

function restauraUltimo() {												// restaura tabuleiro
	estado = meta;
	exibeEstado(estado);
}

function casosTeste(n) {
	switch (n) {
		case 1:
			estado = [["7","1","3"],["2","6","9"],["5","4","8"]];		// profundidade 11
			break;
		case 2:
			estado = [["4","2","3"],["6","9","1"],["7","5","8"]];		// profundidade 12
			break;
		case 3:
			estado = [["2","3","7"],["5","4","8"],["9","6","1"]];		// profundidade 26
			break;
	}
	exibeEstado(estado);
}

function ativaBotoes(t) {
	desativaBotoes(false);
}

function desativaBotoes(t) {
	if (t == undefined) {
		t = true;
	}
	document.getElementById("embaralha").disabled = t;
	document.getElementById("busca").disabled = t;
	document.getElementById("restaura").disabled = t;
	document.getElementById("caso1").disabled = t;
	document.getElementById("caso2").disabled = t;
	document.getElementById("caso3").disabled = t;
}

function calculaTempo() {
	var tempo = new Date().getTime() - tempoInicio;						// calcula tempo transcorrido
	var tms = pad(tempo%1000,3);
	tempo = Math.floor(tempo/1000);
	var tseg = pad(tempo%60,2);
	tempo = Math.floor(tempo/60);
	var tmin = pad(tempo%60,2);
	tempo = Math.floor(tempo/60);
	document.getElementById("tempo").innerHTML = pad(tempo,2)+":"+tmin+":"+tseg+"."+tms;
}

function pad(num,tam) {													// formata números com zeros à esquerda
	var str = num.toString();
	while (str.length < tam)
		str = '0'+str;

	return str;
}