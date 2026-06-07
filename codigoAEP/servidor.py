import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

aplicativo = Flask(__name__)
CORS(aplicativo)

# ==========================================
# 1. BANCO DE DADOS FIXO (100 ELEMENTOS)
# ==========================================
# Colunas: (material_id, esta_limpo, esta_seco, tem_gordura, classificacao)
# Legenda Material: 0=Plástico, 1=Papel, 2=Vidro, 3=Metal, 4=Orgânico
# Legenda Booleana: 1=Sim, 0=Não

dados_brutos = [
    # --- 20 EXEMPLOS DE PLÁSTICO (0) ---
    # Plástico limpo e sem gordura é reciclável (mesmo se estiver molhado)
    (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'),
    (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'), (0, 1, 1, 0, 'Reciclável'),
    (0, 1, 0, 0, 'Reciclável'), (0, 1, 0, 0, 'Reciclável'), (0, 1, 0, 0, 'Reciclável'), (0, 1, 0, 0, 'Reciclável'), # Molhados
    # Plástico sujo ou com gordura vira rejeito até ser lavado
    (0, 0, 1, 0, 'Rejeito'), (0, 0, 1, 0, 'Rejeito'), (0, 0, 1, 0, 'Rejeito'), (0, 0, 1, 0, 'Rejeito'),
    (0, 0, 0, 1, 'Rejeito'), (0, 0, 0, 1, 'Rejeito'), (0, 0, 0, 1, 'Rejeito'), (0, 0, 0, 1, 'Rejeito'),

    # --- 20 EXEMPLOS DE PAPEL/PAPELÃO (1) ---
    # Papel tem que estar limpo, SECO e sem gordura
    (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'),
    (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'), (1, 1, 1, 0, 'Reciclável'),
    # Papel molhado estraga as fibras, é rejeito
    (1, 1, 0, 0, 'Rejeito'), (1, 1, 0, 0, 'Rejeito'), (1, 1, 0, 0, 'Rejeito'), (1, 1, 0, 0, 'Rejeito'),
    # Caixa de pizza (com gordura) ou papel toalha sujo
    (1, 0, 1, 1, 'Rejeito'), (1, 0, 1, 1, 'Rejeito'), (1, 0, 1, 1, 'Rejeito'), (1, 0, 1, 1, 'Rejeito'),
    (1, 0, 0, 1, 'Rejeito'), (1, 0, 0, 1, 'Rejeito'), (1, 0, 0, 1, 'Rejeito'), (1, 0, 0, 1, 'Rejeito'),

    # --- 20 EXEMPLOS DE VIDRO (2) ---
    # Vidro recicla bem, mas precisa estar sem resíduos perigosos/sujeira pesada
    (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'),
    (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'),
    (2, 1, 1, 0, 'Reciclável'), (2, 1, 1, 0, 'Reciclável'),
    (2, 1, 0, 0, 'Reciclável'), (2, 1, 0, 0, 'Reciclável'), (2, 1, 0, 0, 'Reciclável'), (2, 1, 0, 0, 'Reciclável'), # Molhados
    (2, 0, 1, 0, 'Rejeito'), (2, 0, 1, 0, 'Rejeito'), (2, 0, 1, 0, 'Rejeito'), (2, 0, 1, 0, 'Rejeito'),
    (2, 0, 1, 0, 'Rejeito'), (2, 0, 1, 0, 'Rejeito'),

    # --- 20 EXEMPLOS DE METAL (3) ---
    # Metal recicla bem, mas latas com muito óleo/graxa não lavadas são rejeitadas
    (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'),
    (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'),
    (3, 1, 1, 0, 'Reciclável'), (3, 1, 1, 0, 'Reciclável'),
    (3, 1, 0, 0, 'Reciclável'), (3, 1, 0, 0, 'Reciclável'), (3, 1, 0, 0, 'Reciclável'), (3, 1, 0, 0, 'Reciclável'), # Molhadas
    (3, 0, 1, 1, 'Rejeito'), (3, 0, 1, 1, 'Rejeito'), (3, 0, 1, 1, 'Rejeito'), (3, 0, 1, 1, 'Rejeito'),
    (3, 0, 1, 1, 'Rejeito'), (3, 0, 1, 1, 'Rejeito'),

    # --- 20 EXEMPLOS DE ORGÂNICO (4) ---
    # Comida sempre será orgânico, independente dos outros status
    (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'), # Resto de refeição
    (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'),
    (4, 0, 0, 1, 'Orgânico'), (4, 0, 0, 1, 'Orgânico'),
    (4, 0, 1, 0, 'Orgânico'), (4, 0, 1, 0, 'Orgânico'), (4, 0, 1, 0, 'Orgânico'), (4, 0, 1, 0, 'Orgânico'), # Cascas secas
    (4, 0, 1, 0, 'Orgânico'),
    (4, 0, 0, 0, 'Orgânico'), (4, 0, 0, 0, 'Orgânico'), (4, 0, 0, 0, 'Orgânico'), (4, 0, 0, 0, 'Orgânico'), # Borra de café
    (4, 0, 0, 0, 'Orgânico')
]

colunas = ['material_id', 'esta_limpo', 'esta_seco', 'tem_gordura', 'classificacao']
tabela_lixo = pd.DataFrame(dados_brutos, columns=colunas)

X = tabela_lixo[['material_id', 'esta_limpo', 'esta_seco', 'tem_gordura']]
y = tabela_lixo['classificacao']

X_treino, X_teste, y_treino, y_teste = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

arvore_decisao = DecisionTreeClassifier(max_depth=4, random_state=42)
arvore_decisao.fit(X_treino, y_treino)

previsoes_teste = arvore_decisao.predict(X_teste)
acuracia = accuracy_score(y_teste, previsoes_teste)

print("\n=== INFORMAÇÕES DO MODELO DE IA ===")
print(f"Total de registros na base: {len(tabela_lixo)}")
print(f"Treino: {len(X_treino)} | Teste: {len(X_teste)}")
print(f"Acurácia da Árvore de Decisão: {acuracia * 100:.2f}%\n")

@aplicativo.route('/classificar-lixo', methods=['POST'])
def classificar_lixo():
    dados_recebidos = request.json
    nome_material = dados_recebidos.get('material')
    esta_limpo = 1 if dados_recebidos.get('limpo') else 0
    esta_seco = 1 if dados_recebidos.get('seco') else 0
    tem_gordura = 1 if dados_recebidos.get('gordura') else 0

    dicionario_materiais = {
        'Plastico': 0, 'Plástico': 0,
        'Papel': 1, 'Papelão': 1,
        'Vidro': 2,
        'Metal': 3,
        'Comida': 4, 'Resto de Comida': 4, 'Orgânico': 4
    }
    
    material_numero = dicionario_materiais.get(nome_material, -1)

    if material_numero == -1:
        return jsonify({
            "classificacao": "Desconhecido",
            "orientacao_descarte": "Material não reconhecido pela IA."
        })

    previsao_ia = arvore_decisao.predict([[material_numero, esta_limpo, esta_seco, tem_gordura]])
    resultado_final = previsao_ia[0]

    if resultado_final == 'Reciclável':
        orientacao = "Pode descartar na lixeira de coleta seletiva correspondente."
    elif resultado_final == 'Rejeito':
        orientacao = "Devido às condições do material (sujeira, gordura ou umidade), ele deve ir para o lixo comum (rejeito)."
    else:
        orientacao = "Material orgânico. Descarte na lixeira marrom ou utilize para compostagem."

    return jsonify({
        "classificacao": resultado_final,
        "orientacao_descarte": orientacao
    })

if __name__ == '__main__':
    aplicativo.run(host='0.0.0.0', port=5000)