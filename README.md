# Projeto Python – API de Confecção de Orçamentos

Este projeto tem como objetivo desenvolver uma API para a geração de orçamentos da empresa *POWER MOTO GROUP*. O sistema permitirá a criação de orçamentos de forma estruturada, seguindo um formato padronizado para melhor organização e compreensão.
Com esse projeto viso realizar os orçamentos manuais de forma mais rápida, e estabelecer um banco de dados para os ites e o registro dos orçamentos

##### Formato do Orçamento:
Cada item do orçamento seguirá o seguinte modelo:

Nome do item (código da peça) - <número de unidades> UNIDADES *(Caso tenha mais de uma unidade)*
Valor: R$ <valor do item>

*Casos de prazo:*
- Itens em estoque: 
Prazo: À pronta entrega 

- Itens de encomenda:
Prazo estimado: <dias> úteis (encomenda)

Exemplo de orçamento:

```
Filtro de óleo (JG571014) 
Valor: R$ 21,38
Prazo: À pronta entrega
```

## Tecnologias:

O projeto será feito via Pyhton, para o banco de dados vamos utilizar a bibilioteca SQLALCHEMY, utilizando POSTGRESQL

## As rotas principais são: 

### clientes

/clientes - (GET, POST)

/clientes/id - (GET, 
PUT, DELETE)

### Itens
/itens  -  GET, POST)


/itens/SKU    -  (GET, PUT, DELETE)

### Itens

/itensPedido - (GET, POST)


/itensPedido/id - (GET, PUT, DELETE)

### pedidos

/pedidos - (GET, POST)


/pedidos/id - (GET, PUT, DELETE)
