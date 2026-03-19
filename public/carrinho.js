const CHAVE_CARRINHO = "mm_montagens_carrinho";

// Pega os itens salvos
function getCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

// Salva e atualiza a interface
function salvarCarrinho(itens) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
    if (typeof atualizarIcones === 'function') atualizarIcones();
}

// Função que o botão verde da página de produto usa
window.adicionarComVariacaoInterna = function(slug, nome, codigo, img, qty, variacao, preco) {
    let carrinho = getCarrinho();
    
    const index = carrinho.findIndex(item => item.codigo === codigo && item.variacao === variacao);

    if (index > -1) {
        carrinho[index].qty += qty;
        carrinho[index].preco = preco; 
    } else {
        carrinho.push({ slug, nome, codigo, img, qty, variacao, preco });
    }

    salvarCarrinho(carrinho);
};

// Função para atualizar as bolinhas de contagem
function atualizarIcones() {
    const carrinho = getCarrinho();
    const totalItens = carrinho.length; 

    const bolinhas = document.querySelectorAll('.badge-carrinho');
    bolinhas.forEach(b => {
        if (totalItens > 0) {
            b.classList.remove('hidden');
            b.innerText = totalItens > 9 ? "9+" : totalItens;
        } else {
            b.classList.add('hidden');
        }
    });

    const btnFlutuante = document.getElementById('btn-carrinho-flutuante');
    if (btnFlutuante) {
        totalItens > 0 ? btnFlutuante.classList.replace('hidden', 'flex') : btnFlutuante.classList.replace('flex', 'hidden');
    }
}

// Renderiza a lista no carrinho.astro
window.renderizarCarrinhoCompleto = function() {
    const itens = getCarrinho();
    const container = document.getElementById('lista-carrinho');
    const totalGeralElement = document.getElementById('total-geral-carrinho');
    const resumoProdutos = document.getElementById('resumo-total-produtos');
    const resumoPecas = document.getElementById('resumo-total-pecas');
    
    if (!container) return;

    let somaTotalCompra = 0;
    let totalPecas = 0;
    container.innerHTML = "";

    if (itens.length === 0) {
        document.getElementById('carrinho-conteudo')?.classList.add('hidden');
        document.getElementById('carrinho-vazio')?.classList.remove('hidden');
        return;
    }

    itens.forEach((item, index) => {
        const subtotalItem = item.preco * item.qty;
        somaTotalCompra += subtotalItem;
        totalPecas += item.qty;

        container.innerHTML += `
            <div class="flex flex-col md:grid md:grid-cols-[1fr_120px_120px_60px] gap-4 p-4 md:p-6 border-b border-gray-100 items-center hover:bg-gray-50 transition">
                <div class="flex items-center gap-4 w-full">
                    <img src="${item.img}" class="w-16 h-16 object-contain bg-white border border-gray-100 rounded-lg p-2" />
                    <div>
                        <h4 class="font-black text-gray-900 leading-tight text-sm">${item.nome}</h4>
                        <p class="text-[10px] font-black text-gray-400 uppercase">${item.variacao}</p>
                        <p class="text-xs text-mm-blue font-black mt-1">Un: R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
                <div class="flex items-center justify-center font-bold text-gray-600">x ${item.qty}</div>
                <div class="text-right font-black text-gray-900 text-sm">R$ ${subtotalItem.toFixed(2).replace('.', ',')}</div>
                <div class="flex justify-center">
                    <button onclick="removerItem(${index})" class="text-gray-300 hover:text-red-500 transition-colors p-2">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>`;
    });

    if (resumoProdutos) resumoProdutos.innerText = itens.length;
    if (resumoPecas) resumoPecas.innerText = totalPecas;
    if (totalGeralElement) {
        totalGeralElement.innerText = somaTotalCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
};

// Função para remover item
window.removerItem = function(index) {
    let carrinho = getCarrinho();
    carrinho.splice(index, 1);
    salvarCarrinho(carrinho);
    renderizarCarrinhoCompleto();
};

// --- NOVA FUNÇÃO COM LOADING DE 0.5s ---
window.enviarParaWhatsApp = function() {
    const btn = document.querySelector('button[onclick="enviarParaWhatsApp()"]');
    const itens = getCarrinho();
    
    if (itens.length === 0) return;

    // Inicia Loading
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin text-2xl"></i> Processando...`;

    setTimeout(() => {
        let texto = "Olá, MM Montagens! Gostaria de um orçamento:%0A%0A";
        let totalGeral = 0;
        
        itens.forEach(i => { 
            const subtotal = i.qty * i.preco;
            totalGeral += subtotal;
            texto += `*${i.qty}x ${i.nome}*%0A`;
            texto += ` ${i.variacao}%0A`;
            texto += ` Un: R$ ${i.preco.toFixed(2).replace('.', ',')} | Sub: R$ ${subtotal.toFixed(2).replace('.', ',')}%0A%0A`;
        });
        
        texto += `*TOTAL ESTIMADO: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A%0A`;
        texto += "Aguardamos o retorno para fechamento.";
        
        window.open(`https://wa.me/55819932433674?text=${texto}`, "_blank");

        // Restaura o botão
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }, 500); // 0.5 segundos de loading
};

window.addEventListener('DOMContentLoaded', () => {
    atualizarIcones();
    renderizarCarrinhoCompleto();
});