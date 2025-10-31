#### Como rodar o back-end

1- Banco postgresql instalado na máquina + pgadmin

2- Abrir o PGAdmin e criar um novo banco de dados chamado: vision_sense

3- Clonar o repositório no github: git clone https://github.com/Pedrohprado/project_vision_sense.git

4- Instalar as dependências: npm install

5- Crie um arquivo .env no projeto e copie o que está em .env.example -> .env

6- vamos mudar o DATABASE_URL:
postgresql://username:yourpassword@localhost:5432/your_db?schema=public"

![alt text](image.png)

7- rodar os comando do prisma:
7.1 - npx prisma generate -> vai fazer o código entender os models criados;
7.2 - npx prisma migrate dev -> vai colocar os models no banco de dados;

8 - Buildar a aplicação: npm run build

9 - criar um user e um device na mão: #nemtudosãoflores 🥀
9.1 - abra o INSOMNIA(tem que instalar no pc):
![alt text](image-1.png)

9.2 - depois do usuário criado, vamos vincular um device nele: npx prisma a studio
![alt text](image-2.png)

10 - Rode o projeto: npm run dev
