# Lake

A simple project management system

## Getting Started

1. Clone the repo.

```bash
$ git clone git@github.com:chauhankiran/lake.git
```

2. Go inside the cloned repo.

```bash
$ cd lake
```

3. Install the required dependencies.

```bash
$ npm i
```

4. Rename the `.env.example` to `.env` and the adjust the variables inside. The project is tested against PostgreSQL.

5. Run the migrations.

```bash
$ npx sequelize db:migrate
```

6. You're ready to run the application locally.

```bash
$ npm run dev
```

or

```bash
$ npm start
```

Enjoy!

### License

MIT License Copyright (c) 2023 KC
