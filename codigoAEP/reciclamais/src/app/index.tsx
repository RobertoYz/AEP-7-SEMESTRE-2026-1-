import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AplicativoReciclaMais() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [modoTela, setModoTela] = useState('login'); 
  
  const [emailSalvo, setEmailSalvo] = useState('');
  const [senhaSalva, setSenhaSalva] = useState('');
  
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  
  const [mensagemErroAcesso, setMensagemErroAcesso] = useState('');
  const [mensagemErroIA, setMensagemErroIA] = useState('');
  
  const [material, setMaterial] = useState('Plástico');
  const [estaLimpo, setEstaLimpo] = useState(true);
  const [estaSeco, setEstaSeco] = useState(true);
  const [temGordura, setTemGordura] = useState(false);
  const [resultado, setResultado] = useState(null);

  const opcoesMateriais = ['Plástico', 'Papel', 'Vidro', 'Metal', 'Orgânico'];
  const descricoesMateriais = {
    'Plástico': 'Ex: Garrafas PET, potes, embalagens, copos descartáveis e sacolas.',
    'Papel': 'Ex: Caixas de papelão, jornais, revistas, cadernos e folhas soltas.',
    'Vidro': 'Ex: Garrafas de bebida, potes de conserva, frascos e copos.',
    'Metal': 'Ex: Latas de alumínio, tampinhas, panelas, pregos e arames.',
    'Orgânico': 'O que é: Restos de comida, cascas de frutas/legumes, borra de café, etc.'
  };

  const realizarCadastro = () => {
    setMensagemErroAcesso('');

    if (emailInput.trim() === '') {
      setMensagemErroAcesso('Por favor, insira um nome de usuário.');
      return;
    }

    const temMaiusculaNoInicio = /^[A-Z]/.test(senhaInput);
    const temCaractereEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senhaInput);

    if (!temMaiusculaNoInicio && !temCaractereEspecial) {
      setMensagemErroAcesso('Erro - A primeira letra deve ser Maiúscula e precisa incluir um caractere especial (!, @, #, etc).');
    } else if (!temMaiusculaNoInicio) {
      setMensagemErroAcesso('Erro - A primeira letra da senha deve ser Maiúscula.');
    } else if (!temCaractereEspecial) {
      setMensagemErroAcesso('Erro -  Falta um caracter especial (!, @, #, etc).');
    } else {
      setEmailSalvo(emailInput);
      setSenhaSalva(senhaInput);
      
      setEmailInput('');
      setSenhaInput('');
      setModoTela('login');
    }
  };

  const realizarLogin = () => {
    setMensagemErroAcesso('');

    if (emailInput === emailSalvo && senhaInput === senhaSalva && emailSalvo !== '') {
      setUsuarioLogado(true);
      setEmailInput(''); 
      setSenhaInput('');
    } else {
      setMensagemErroAcesso('O usuário ou a senha estão incorretos.');
    }
  };

  const alternarModoTela = () => {
    setModoTela(modoTela === 'login' ? 'cadastro' : 'login');
    setEmailInput(''); 
    setSenhaInput('');
    setMensagemErroAcesso('');
  };

  const fazerLogout = () => {
    setUsuarioLogado(false);
    setResultado(null); 
    setMaterial('Plástico'); 
    setEstaLimpo(true);
    setEstaSeco(true);
    setTemGordura(false);
    setMensagemErroIA('');
  };

  const enviarParaClassificacao = async () => {
    setMensagemErroIA(''); 

    try {
      const resposta = await fetch('http://127.0.0.1:5000/classificar-lixo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: material,
          limpo: estaLimpo,
          seco: estaSeco,
          gordura: temGordura
        })
      });

      const dados = await resposta.json();
      setResultado(dados);
    } catch (erro) {
      setMensagemErroIA('Não foi possível conectar ao servidor da Inteligência Artificial. Verifique se o Python está rodando.');
    }
  };

  if (!usuarioLogado) {
    return (
      <View style={estilos.containerCentralizado}>
        <Text style={estilos.titulo}>Recicla+</Text>
        <Text style={estilos.subtitulo}>
          {modoTela === 'login' ? 'Acesso ao Sistema' : 'Crie sua Conta Individual'}
        </Text>
        
        <TextInput
          style={estilos.campoEntrada}
          placeholder="Usuário"
          value={emailInput}
          onChangeText={setEmailInput}
          autoCapitalize="none"
        />
        <TextInput
          style={estilos.campoEntrada}
          placeholder="Senha"
          value={senhaInput}
          onChangeText={setSenhaInput}
          secureTextEntry={modoTela === 'login'} 
        />

        {modoTela === 'cadastro' && (
          <Text style={estilos.dicaSenha}>
            AVISO: A senha deve começar com uma letra Maiúscula e conter pelo menos um caractere especial (ex: @, #, $).
          </Text>
        )}

        {mensagemErroAcesso ? (
          <Text style={estilos.textoErroAviso}>{mensagemErroAcesso}</Text>
        ) : null}
        
        {modoTela === 'login' ? (
          <>
            <TouchableOpacity style={estilos.botaoPrincipal} onPress={realizarLogin}>
              <Text style={estilos.textoBotaoBranco}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoSecundarioTexto} onPress={alternarModoTela}>
              <Text style={estilos.textoLink}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={estilos.botaoPrincipal} onPress={realizarCadastro}>
              <Text style={estilos.textoBotaoBranco}>Cadastrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoSecundarioTexto} onPress={alternarModoTela}>
              <Text style={estilos.textoLink}>Já possui conta? Faça o Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.containerScroll}>
      <Text style={estilos.titulo}>Análise de Resíduo</Text>
      
      <Text style={estilos.rotulo}>Qual o material predominante?</Text>
      <View style={estilos.containerMateriais}>
        {opcoesMateriais.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              estilos.botaoMaterial, 
              material === item && estilos.botaoMaterialAtivo 
            ]}
            onPress={() => setMaterial(item)}
          >
            <Text style={[
              estilos.textoBotaoMaterial,
              material === item && estilos.textoBotaoMaterialAtivo
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={estilos.textoDescricao}>
        {descricoesMateriais[material]}
      </Text>
      
      <Text style={estilos.rotulo}>Condições do material:</Text>
      
      <TouchableOpacity 
        style={[estilos.botaoAlternancia, estaLimpo ? estilos.ativoVerde : estilos.ativoCinza]} 
        onPress={() => setEstaLimpo(!estaLimpo)}
      >
        <Text style={estilos.textoBotaoBranco}>
          {estaLimpo ? 'O resíduo está LIMPO' : 'O resíduo está SUJO'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[estilos.botaoAlternancia, estaSeco ? estilos.ativoVerde : estilos.ativoAzul]} 
        onPress={() => setEstaSeco(!estaSeco)}
      >
        <Text style={estilos.textoBotaoBranco}>
          {estaSeco ? 'O resíduo está SECO' : 'O resíduo está MOLHADO'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[estilos.botaoAlternancia, !temGordura ? estilos.ativoVerde : estilos.ativoAmarelo]} 
        onPress={() => setTemGordura(!temGordura)}
      >
        <Text style={estilos.textoBotaoBranco}>
          {!temGordura ? 'NÃO possui gordura' : 'POSSUI gordura/óleo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botaoPrincipal} onPress={enviarParaClassificacao}>
        <Text style={estilos.textoBotaoBranco}>Consultar</Text>
      </TouchableOpacity>

      {mensagemErroIA ? (
        <Text style={estilos.textoErroAviso}>{mensagemErroIA}</Text>
      ) : null}

      {resultado && (
        <View style={[
          estilos.caixaResultado,
          resultado.classificacao === 'Rejeito' && estilos.caixaResultadoRejeito
        ]}>
          <Text style={[
            estilos.textoDestaque,
            resultado.classificacao === 'Rejeito' && estilos.textoDestaqueRejeito
          ]}>
            Destino: {resultado.classificacao}
          </Text>
          <Text style={estilos.textoNormal}>{resultado.orientacao_descarte}</Text>
        </View>
      )}

      <TouchableOpacity style={estilos.botaoSair} onPress={fazerLogout}>
        <Text style={estilos.textoBotaoSair}>Sair da Conta</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  containerCentralizado: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F4FBF4',
  },
  containerScroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#F4FBF4',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  rotulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  campoEntrada: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  dicaSenha: {
    fontSize: 13,
    color: '#757575',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  textoErroAviso: {
    color: '#D32F2F', 
    backgroundColor: '#FFEBEE', 
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF9A9A',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  containerMateriais: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  botaoMaterial: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botaoMaterialAtivo: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  textoBotaoMaterial: {
    color: '#333',
    fontWeight: '500',
  },
  textoBotaoMaterialAtivo: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  textoDescricao: {
    fontSize: 14,
    color: '#546E7A',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  botaoPrincipal: {
    backgroundColor: '#1B5E20',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  botaoSecundarioTexto: {
    marginTop: 20,
    alignItems: 'center',
  },
  textoLink: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  botaoAlternancia: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  ativoVerde: {
    backgroundColor: '#4CAF50',
  },
  ativoCinza: {
    backgroundColor: '#9E9E9E',
  },
  ativoAzul: {
    backgroundColor: '#29B6F6', 
  },
  ativoAmarelo: {
    backgroundColor: '#FBC02D', 
  },
  textoBotaoBranco: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  caixaResultado: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  textoDestaque: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  caixaResultadoRejeito: {
    backgroundColor: '#FFEBEE', 
    borderColor: '#F44336',     
  },
  textoDestaqueRejeito: {
    color: '#B71C1C',           
  },
  textoNormal: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  botaoSair: {
    marginTop: 40,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D32F2F', 
    alignItems: 'center',
  },
  textoBotaoSair: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  }
});