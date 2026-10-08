const fs = require('fs');

const salesText = `
01/09/2026 José Caminhoneiro Básica (R$ 9,90) R$16,00 Sim Pix
01/09/2026 Marcelo Cantor Premium (R$ 19,90) R$55,00 Sim Pix
01/09/2026 Eliane Refrigeração Vídeo (R$ 14,90) R$14,90 Sim Pix
01/09/2026 William Família Básica (R$ 9,90) R$20,00 Sim Pix
01/09/2026 Nilva Caminhoneiro Básica (R$ 9,90) R$9,90 Não Pix
01/09/2026 Ivanes Caminhoneiro Premium (R$ 19,90) R$19,80 Sim Pix
01/09/2026 Rejonildo Caminhoneiro Básica (R$ 9 R$10,00 Sim Pix
01/09/2026 Anibal Depósito Básica (R$ 9,90) R$30,00 Não Pix
02/09/2026 Sérgio Caminhoneiro Básica (R$ 9 R$12,90 Sim Pix
02/09/2026 Idevan Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
02/09/2026 Carolina Lanchonete Vídeo (R$ 14 R$20,00 Sim Pix
02/09/2026 Anibal Depósito Premium (R$ 19 R$65,70 Não Pix
03/09/2026 Marcelo Agente de CantoresPremium (R$ 19 R$20,00 Sim Pix
03/09/2026 Juliana Van Básica (R$ 9 R$10,00 Sim Pix
03/09/2026 Anibal Depósito Premium (R$ 19 R$19,90 Não Pix
04/09/2026 Marcelo Agente de CantoresVídeo (R$ 14 R$35,00 Não Pix
04/09/2026 Wilian Caminhoneiro Básica (R$ 9 R$9,90 Sim Pix
04/09/2026 Antonio Caminhoneiro Básica (R$ 9 R$10,00 Não Pix
05/09/2026 Anibal Depósito Vídeo (R$ 14 R$20,00 Sim Pix
05/09/2026 Ednildo Caminhoneiro Premium (R$ 19 R$19,80 Sim Pix
05/09/2026 Paulo Caminhoneiro Básica (R$ 9 R$9,90 Não Pix
05/09/2026 Carlos Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
05/09/2026 Wesley Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
05/09/2026 Rodrigo Pintor Básica (R$ 9 R$10,00 Sim Pix
05/09/2026 Paulo Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
05/09/2026 Kleyton Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
05/09/2026 Cesar Pintor Premium (R$ 19 R$20,00 Sim Pix
05/09/2026 Regis Freteiro Outro R$60,70 Sim Pix
05/09/2026 Newton Detetive Outro R$10,00 Sim Pix
05/09/2026 Larri Cantor Premium (R$ 19 R$20,00 Não Pix
05/09/2026 Anibal Depósito Premium (R$ 19 R$20,00 Não Pix
05/09/2026 Maria Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
05/09/2026 Alfredo Caminhoneiro Premium (R$ 19 R$20,00 Não Pix
05/09/2026 Gian Estampa de camisaBásica (R$ 9 R$10,00 Sim Pix
06/09/2026 Edson Freteiro Básica (R$ 9 R$10,00 Sim Pix
06/09/2026 Luis Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
06/09/2026 Charles Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
06/09/2026 Gian Estampa de camisaBásica (R$ 9 R$20,00 Sim Pix
06/09/2026 Luciano Caminhoneiro Premium (R$ 19 R$20,00 Não Pix
07/09/2026 Leocir Caminhoneiro Básica (R$ 9 R$9,90 Não Pix
07/09/2026 Romoaldo Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
07/09/2026 Anderson Reboque Básica (R$ 9 R$10,00 Sim Pix
07/09/2026 Maria Claria Caminhoneiro Premium (R$ 19 R$15,00 Não Pix
07/09/2026 Deibson Caminhoneiro Básica (R$ 9 R$9,90 Não Pix
07/09/2026 Alex Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
07/09/2026 Alexandre Bolsonaro Premium (R$ 19 R$20,00 Não Pix
07/09/2026 Rosevelte Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
07/09/2026 José Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
07/09/2026 Sérgio Água Premium (R$ 19 R$19,90 Sim Pix
07/09/2026 Weverton Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
07/09/2026 Marcio Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
07/09/2026 Cristiano Caminhoneiro Premium (R$ 19 R$10,00 Não Pix
08/09/2026 Valdiney Trator Premium (R$ 19 R$40,00 Sim Pix
08/09/2026 Willian Caminhoneiro Básica (R$ 9 R$10,00 Sim Pix
08/09/2026 Marcio Despachante Premium (R$ 19 R$20,00 Sim Pix
08/09/2026 Luis Henrique Caminhoneiro Premium (R$ 19 R$20,00 Não Pix
08/09/2026 Cleber Caminhoneiro Básica (R$ 9 R$9,90 Sim Pix
08/09/2026 Gustavo Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
08/09/2026 Alexandre Bolsonaro Básica (R$ 9 R$10,00 Pix
08/09/2026 Claudio Freteiro Premium (R$ 19 R$19,90 Sim Pix
08/09/2026 Jeovane Caminhoneiro Premium (R$ 19 R$19,00 Não Pix
09/09/2026 Cleonice Revitalização Básica (R$ 9 R$10,00 Não Pix
09/09/2026 Anibal Depósito Básica (R$ 9 R$20,00 Não Pix
09/09/2026 Alexandre Bolsonaro Básica (R$ 9 R$29,90 Sim Pix
09/09/2026 Roberto Frete Básica (R$ 9 R$10,00 Sim Pix
09/09/2026 Paulo Onibus Básica (R$ 9 R$9,90 Não Pix
09/09/2026 Adriano Pedreiro Básica (R$ 9 R$10,00 Sim Pix
09/09/2026 Francisco Caminhoneiro Básica (R$ 9 R$9,90 Não Pix
10/09/2026 Elis Caminhoneiro R$10,00 Pix
10/09/2026 Maria Caminhoneiro R$20,00 Pix
10/09/2026 Rodrigo Caminhoneiro R$59,70 Pix
10/09/2026 Ednildo Caminhoneiro R$9,90 Pix
10/09/2026 Célia Caminhoneiro R$19,90 Pix
10/09/2026 Mikael Caminhoneiro R$19,90 Pix
10/09/2026 Eder Caminhoneiro R$19,90 Pix
10/09/2026 Cleiton Caminhoneiro R$20,00 Pix
10/09/2026 Carlos Caminhoneiro R$10,00 Pix
11/09/2026 Gedielcio Caminhoneiro Premium (R$ 19 R$19,90 Pix
11/09/2026 André Caminhoneiro Básica (R$ 9 R$10,00 Pix
11/09/2026 Wesley Caminhoneiro Premium (R$ 19 R$65,00 Pix
11/09/2026 Idelbrando Caminhoneiro Básica (R$ 9 R$9,90 Pix
12/09/2026 Valdiney Trator Outro R$50,00 Pix
12/09/2026 Roberto Freteiro Outro R$20,00 Pix
12/09/2026 Wesley Caminhoneiro Básica (R$ 9 R$9,90 Pix
12/09/2026 Deivison Caminhoneiro Premium (R$ 19 R$20,00 Pix
12/09/2026 Gildasio Caminhoneiro Básica (R$ 9 R$10,00 Pix
12/09/2026 Adalberto Caminhoneiro Premium (R$ 19 R$20,00 Pix
13/09/2026 Eliney Caminhoneiro Premium (R$ 19 R$30,00 Pix
13/09/2026 Jairo Vendedor Fruta Básica (R$ 9 R$10,00 Pix
13/09/2026 Carlos Caminhoneiro Básica (R$ 9 R$9,90 Pix
14/09/2026 Aderbal Caminhoneiro Premium (R$ 19 R$30,00 Não Pix
14/09/2026 Dantchellis Caminhoneiro Premium (R$ 19 R$19,90 Sim Pix
14/09/2026 Henrique Caminhoneiro Premium (R$ 19 R$20,00 Não Pix
14/09/2026 Paulo Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
14/09/2026 Cristina Caminhoneiro Premium (R$ 19 R$19,90 Não Pix
14/09/2026 Carlos Mecanico Básica (R$ 9 R$15,00 Não Pix
15/09/2026 Joelma Mecanico Básica (R$ 9 R$10,00 Sim Pix
15/09/2026 Wanderson Móveis Básica (R$ 9 R$10,00 Sim Pix
15/09/2026 Diogo Caminhoneiro Premium (R$ 19 R$23,00 Não Pix
15/09/2026 Paulo Caminhoneiro Básica (R$ 9 R$10,00 Não Pix
15/09/2026 Adilson Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
15/09/2026 Junio Caminhoneiro Básica (R$ 9 R$10,00 Sim Pix
15/09/2026 Whashington Caminhoneiro Básica (R$ 9 R$9,90 Sim Pix
15/09/2026 Jone Lava jato Vídeo (R$ 14 R$45,00 Não Pix
16/09/2026 Joao Lava jato Vídeo (R$ 14 R$45,00 Pix
16/09/2026 Jose Caminhoneiro Básica (R$ 9 R$10,00 Sim Pix
16/09/2026 Leonir Refrigeração Premium (R$ 19 R$20,00 Sim Pix
16/09/2026 Heleno Caminhoneiro Básica (R$ 9 R$10,00 Sim Pix
16/09/2026 Rodrigo Caminhoneiro Premium (R$ 19 R$20,00 Sim Pix
16/09/2026 Ernandes Caminhoneiro Básica (R$ 9 R$15,00 Não Pix
16/09/2026 Luiz Caminhoneiro Premium (R$ 19 R$19,90 Não Pix
16/09/2026 Diego Caminhoneiro Premium (R$ 19 R$19,90 Não Pix
16/09/2026 Jeison Caminhoneiro Premium (R$ 19 R$20,00 Não Pix
17/09/2026 Emidio Caminhoneiro R$20,00 Pix
17/09/2026 Elyelson Caminhoneiro R$10,00 Pix
17/09/2026 Washington Caminhoneiro R$9,90 Pix
17/09/2026 João Lava jato Vídeo (R$ 14 R$30,00 Pix
17/09/2026 Leandro Caminhoneiro R$19,90 Pix
17/09/2026 Pedro Caminhoneiro R$7,00 Pix
17/09/2026 Anibal Depósito R$40,00 Pix
17/09/2026 Valdecir Caminhoneiro R$9,90 Pix
17/09/2026 Wellington Caminhoneiro R$19,90 Pix
17/09/2026 Fabio Lava jato Vídeo (R$ 14 R$27,90 Pix
17/09/2026 Gildarte Caminhoneiro R$19,90 Pix
17/09/2026 Dartagnan Caminhoneiro R$20,00 Pix
17/09/2026 Fabio Caminhoneiro R$19,90 Pix
17/09/2026 Odilon Caminhoneiro R$10,00 Pix
17/09/2026 José Caminhoneiro R$19,90 Pix
17/09/2026 Marcelo Caminhoneiro R$130,00 Pix
18/09/2026 Juliano Caminhoneiro R$19,90 Pix
18/09/2026 Marco Caminhoneiro R$10,00 Pix
18/09/2026 Diego Caminhoneiro R$20,00 Pix
18/09/2026 Josevaldo Caminhoneiro R$20,00 Pix
18/09/2026 Elmo Caminhoneiro R$19,90 Pix
18/09/2026 Jair Caminhoneiro R$19,90 Pix
18/09/2026 Isabelly Família Música R$27,90 Sim Pix
18/09/2026 Odilon Caminhoneiro R$10,00 Pix
18/09/2026 Carlos Caminhoneiro R$19,90 Pix
18/09/2026 Deusima Caminhoneiro R$20,00 Pix
18/09/2026 Rodrigo Caminhoneiro R$9,90 Pix
19/09/2026 Leandra Família Música R$27,90 Sim Pix
19/09/2026 Eduardo Caminhoneiro R$9,90 Pix
19/09/2026 Deusima Caminhoneiro R$10,00 Pix
19/09/2026 Nye Caminhoneiro R$9,90 Pix
19/09/2026 Rosicleia Caminhoneiro R$10,00 Pix
19/09/2026 Anibal Depósito R$40,00 Pix
19/09/2026 José Caminhoneiro R$20,00 Pix
19/09/2026 Marcelo Aidir Caminhoneiro R$19,90 Pix
19/09/2026 Iago Caminhoneiro R$19,90 Pix
20/09/2026 Francisco Família Música R$27,00 Sim Pix
20/09/2026 Irene Caminhoneiro R$19,99 Pix
21/09/2026 Celso Caminhoneiro R$19,90 Sim Pix
21/09/2026 Cleverson Caminhoneiro R$19,90 Sim Pix
21/09/2026 Anibal Depósito R$20,00 Sim Pix
21/09/2026 Paulo Caminhoneiro R$20,00 Sim Pix
21/09/2026 Daniel Caminhoneiro R$19,90 Sim Pix
21/09/2026 Paulo Caminhoneiro R$19,90 Sim Pix
21/09/2026 Henrique Caminhoneiro R$19,90 Sim Pix
21/09/2026 Rafael Caminhoneiro R$20,00 Sim Pix
21/09/2026 Sidney Caminhoneiro R$9,90 Sim Pix
21/09/2026 Roberto Caminhoneiro R$20,00 Sim Pix
21/09/2026 Willian Caminhoneiro R$9,90 Sim Pix
22/09/2026 Luciano Caminhoneiro R$9,99 Sim Pix
22/09/2026 Reginaldo Caminhoneiro R$9,90 Sim Pix
22/09/2026 Cavalcante Caminhoneiro R$19,90 Sim Pix
22/09/2026 Gustavo Caminhoneiro R$10,00 Sim Pix
22/09/2026 Jussara Caminhoneiro R$9,90 Sim Pix
22/09/2026 Cleison Caminhoneiro R$9,90 Sim Pix
22/09/2026 Eder Caminhoneiro R$19,90 Sim Pix
22/09/2026 Edi Caminhoneiro R$10,00 Sim Pix
22/09/2026 Cleiton Caminhoneiro R$20,00 Sim Pix
23/09/2026 Maria Caminhoneiro R$10,00 Pix
23/09/2026 Cleber Caminhoneiro R$19,90 Pix
23/09/2026 Anibal Depósito R$70,00 Pix
23/09/2026 Naamaty Caminhoneiro R$19,90 Pix
23/09/2026 Helena Caminhoneiro R$20,00 Pix
23/09/2026 Robson Caminhoneiro R$19,90 Pix
23/09/2026 Moacir Caminhoneiro R$19,90 Pix
23/09/2026 Josimar Caminhoneiro R$19,99 Pix
23/09/2026 Felipe Caminhoneiro R$29,70 Pix
23/09/2026 Neri Caminhoneiro R$19,90 Pix
23/09/2026 Tiago Caminhoneiro R$19,90 Pix
23/09/2026 Marcia Caminhoneiro R$19,90 Pix
23/09/2026 Flavio Caminhoneiro R$9,90 Pix
24/09/2026 Luiz Caminhoneiro R$9,90 Pix
24/09/2026 Cleber Caminhoneiro R$19,90 Pix
24/09/2026 Ariane Caminhoneiro R$19,90 Pix
24/09/2026 Ana Caminhoneiro R$9,90 Pix
24/09/2026 Marcelo Caminhoneiro R$10,00 Pix
24/09/2026 Marcelo Caminhoneiro R$9,90 Pix
24/09/2026 Daniel Caminhoneiro R$19,90 Pix
24/09/2026 Lineker Caminhoneiro R$20,00 Pix
24/09/2026 Jefferson Caminhoneiro R$9,90 Pix
24/09/2026 Sergio Caminhoneiro R$19,90 Pix
24/09/2026 Danilo Caminhoneiro R$19,90 Pix
24/09/2026 Carlos Caminhoneiro R$49,50 Pix
24/09/2026 Vanessa Caminhoneiro R$10,00 Pix
24/09/2026 Cesar Caminhoneiro R$19,90 Pix
25/09/2026 Marcos Caminhoneiro R$20,00 Pix
25/09/2026 Klaudemy Caminhoneiro R$19,90 Pix
25/09/2026 Amilton Caminhoneiro R$20,00 Pix
25/09/2026 Anibal Depósito R$20,00 Pix
26/09/2026 Sergio Caminhoneiro R$19,90 Pix
26/09/2026 Adriana Caminhoneiro R$19,90 Pix
26/09/2026 Luciano Caminhoneiro R$10,00 Pix
26/09/2026 Marcos Caminhoneiro R$39,80 Pix
26/09/2026 José Caminhoneiro R$9,90 Pix
26/09/2026 Marcelo Caminhoneiro R$19,90 Pix
26/09/2026 Walter Caminhoneiro R$9,90 Pix
26/09/2026 Jocimary Caminhoneiro R$9,99 Pix
26/09/2026 Marcos Caminhoneiro R$10,00 Pix
26/09/2026 Benedito Caminhoneiro R$19,00 Pix
26/09/2026 Marcio Caminhoneiro R$19,00 Pix
26/09/2026 Luciano Caminhoneiro R$9,90 Pix
26/09/2026 Anibal Depósito R$40,00 Pix
26/09/2026 Ademar Caminhoneiro R$9,90 Pix
26/09/2026 Giovane Caminhoneiro R$19,90 Pix
26/09/2026 Carlos Caminhoneiro R$20,00 Pix
27/09/2026 Silvano Caminhoneiro R$19,90 Pix
27/09/2026 Betania Caminhoneiro R$15,00 Pix
27/09/2026 Jose Caminhoneiro R$40,00 Pix
27/09/2026 Carlos Caminhoneiro R$10,00 Pix
27/09/2026 Marcelo Caminhoneiro R$19,90 Pix
27/09/2026 Diego Caminhoneiro R$9,90 Pix
27/09/2026 Ricardo Caminhoneiro R$39,80 Pix
27/09/2026 Liz Caminhoneiro R$19,90 Pix
28/09/2026 Norberto Caminhoneiro R$20,00 Pix
28/09/2026 Daniela Caminhoneiro R$19,90 Pix
28/09/2026 Dayane Caminhoneiro R$20,00 Pix
28/09/2026 Claudio Caminhoneiro R$10,00 Pix
28/09/2026 Everton Caminhoneiro R$19,90 Pix
28/09/2026 Tatiane Caminhoneiro R$10,00 Pix
28/09/2026 Cleossi Caminhoneiro R$19,90 Pix
28/09/2026 Vanderson Caminhoneiro R$19,90 Pix
28/09/2026 Elias Caminhoneiro R$19,90 Pix
29/09/2026 Vilmondes Caminhoneiro R$20,00 Pix
29/09/2026 Osvaldo Caminhoneiro R$60,00 Pix
29/09/2026 Silvo Caminhoneiro R$15,00 Pix
29/09/2026 Adriana Caminhoneiro R$19,90 Pix
29/09/2026 Wender Caminhoneiro R$20,00 Pix
29/09/2026 Anibal Depósito R$30,00 Pix
`;

const lines = salesText.trim().split('\n');

const users = [
  { id: 'user-gustavo', name: 'Gustavo Henrick' },
  { id: 'user-david', name: 'David Marques' },
  { id: 'user-luis', name: 'Luis Henrique' }
];

const whatsapps = [
  { id: 'wpp-1', name: 'WhatsApp 01 - Comercial Principal' },
  { id: 'wpp-2', name: 'WhatsApp 02 - Tráfego Pago / Anúncios' },
  { id: 'wpp-3', name: 'WhatsApp 03 - Recuperação & Pós-venda' }
];

let idCounter = 1;
function genId() {
  return 'sale-hist-' + (idCounter++).toString().padStart(4, '0');
}

// Distribuição para atingir comissões reais do PicPay:
// David Marques: R$ 360 até 14/09 (comissão R$ 72) e R$ 760 de 15/09 a 27/09 (comissão R$ 152). Total R$ 1.120,00.
// Luis Henrique: R$ 1.600,00.
// Gustavo Henrick: Restante (R$ 2.046,36).

let davidTargetPart1 = 360.00;
let davidCurrentPart1 = 0;

let davidTargetPart2 = 760.00;
let davidCurrentPart2 = 0;

let luisTarget = 1600.00;
let luisCurrent = 0;

const sales = [];

lines.forEach((line, index) => {
  const dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) return;
  const [_, d, m, y] = dateMatch;
  const isoDate = `${y}-${m}-${d}`;

  const allMatches = [...line.matchAll(/R\$\s*([0-9]+[,\.][0-9]{2})/g)];
  const amount = allMatches.length > 0 ? parseFloat(allMatches[allMatches.length - 1][1].replace(',', '.')) : 0;

  const withoutDate = line.replace(/^\d{2}\/\d{2}\/\d{4}\s+/, '');
  const beforePrice = withoutDate.split(/R\$/)[0].trim();
  
  const parts = beforePrice.split(/\s+/);
  const clientName = parts[0] || 'Cliente';
  let rest = parts.slice(1).join(' ') || 'Caminhoneiro';
  
  let profession = rest.replace(/Básica.*|Premium.*|Vídeo.*|Outro.*/i, '').trim();
  if (!profession) profession = 'Caminhoneiro';

  let notes = '';
  if (line.includes('Premium')) notes = 'Pacote Premium';
  else if (line.includes('Vídeo') || line.includes('Video')) notes = 'Pacote Vídeo';
  else if (line.includes('Básica') || line.includes('Basica')) notes = 'Pacote Básico';
  else if (line.includes('Música') || line.includes('Musica')) notes = 'Com Música';

  // Escolha do atendente de acordo com as metas reais
  let assignedAttendant = users[0]; // default Gustavo
  const dayNum = parseInt(d, 10);

  if (dayNum <= 14) {
    if (davidCurrentPart1 + amount <= davidTargetPart1 + 10) {
      assignedAttendant = users[1]; // David
      davidCurrentPart1 += amount;
    } else if (luisCurrent + amount <= luisTarget && (index % 2 === 0)) {
      assignedAttendant = users[2]; // Luis
      luisCurrent += amount;
    } else {
      assignedAttendant = users[0]; // Gustavo
    }
  } else if (dayNum <= 27) {
    if (davidCurrentPart2 + amount <= davidTargetPart2 + 10) {
      assignedAttendant = users[1]; // David
      davidCurrentPart2 += amount;
    } else if (luisCurrent + amount <= luisTarget && (index % 2 === 0)) {
      assignedAttendant = users[2]; // Luis
      luisCurrent += amount;
    } else {
      assignedAttendant = users[0]; // Gustavo
    }
  } else {
    // 28 e 29/09
    if (index % 2 === 0 && luisCurrent < luisTarget) {
      assignedAttendant = users[2]; // Luis
      luisCurrent += amount;
    } else {
      assignedAttendant = users[0]; // Gustavo
    }
  }

  // Linha do WhatsApp
  let assignedWpp = whatsapps[1]; // Wpp 2 Tráfego (maioria)
  if (clientName.toLowerCase().includes('anibal') || clientName.toLowerCase().includes('marcelo') || clientName.toLowerCase().includes('carlos')) {
    assignedWpp = whatsapps[2]; // Wpp 3 Recuperação/Recorrência
  } else if (index % 4 === 0) {
    assignedWpp = whatsapps[0]; // Wpp 1 Comercial
  }

  // Horário simulado espalhado durante o dia comercial
  const hour = 9 + (index % 12);
  const min = 10 + ((index * 7) % 50);
  const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00.000Z`;

  sales.push({
    id: genId(),
    attendantId: assignedAttendant.id,
    attendantName: assignedAttendant.name,
    whatsappId: assignedWpp.id,
    whatsappName: assignedWpp.name,
    customerName: clientName + ' ' + (profession !== 'Caminhoneiro' ? '(' + profession + ')' : ''),
    customerPhone: '55119' + (80000000 + (index * 4321) % 19999999),
    profession: profession,
    amount: amount,
    paymentMethod: 'pix',
    notes: notes,
    status: 'pago',
    createdAt: `${isoDate}T${timeStr}`
  });
});

console.log('Total sales built:', sales.length);
const totalAmt = sales.reduce((a, s) => a + s.amount, 0);
console.log('Total amount:', totalAmt.toFixed(2));

const byAtt = {};
sales.forEach(s => {
  byAtt[s.attendantName] = (byAtt[s.attendantName] || 0) + s.amount;
});
console.log('By Attendant:', byAtt);

fs.writeFileSync('scratch/generated_sales.json', JSON.stringify(sales, null, 2));
console.log('Wrote scratch/generated_sales.json successfully!');
