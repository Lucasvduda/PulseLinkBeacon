PULSELINK BEACON — PLANO DE TESTES
====================================
Versao: 1.0.0
Data: Junho 2026


1. ESCOPO DOS TESTES

Este documento define os planos de teste para o sistema PulseLink Beacon,
cobrindo os seguintes modulos:
- Autenticacao (Login / JWT)
- Dispositivos (Devices/Beacons)
- Alertas (Alerts)
- Leituras de Sensores (Sensor Readings)
- Integracao end-to-end
- Frontend mobile (React Native)
- Simulador IoT


2. AMBIENTE DE TESTES

- Backend: Spring Boot 4.0.6, Java 17
- Banco de Dados: H2 em memoria (dev) / PostgreSQL (prod)
- Frontend: React Native com Expo (SDK 52)
- Simulador: Python 3 com requests
- Ferramenta de API: Postman, curl ou similar
- URL Base: http://localhost:8080/api


3. CREDENCIAIS DE TESTE

| Usuario  | Senha    | Perfil   |
|----------|----------|----------|
| admin    | admin123 | ADMIN    |
| operador | oper123  | OPERATOR |


============================================================================
4. TESTES DE API — AUTENTICACAO
============================================================================

| ID      | Cenario                            | Metodo | Endpoint          | Entrada                                  | Resultado Esperado              |
|---------|------------------------------------|--------|-------------------|------------------------------------------|---------------------------------|
| AUTH-01 | Login com credenciais validas      | POST   | /api/auth/login   | {"username":"admin","password":"admin123"}| 200 OK + token JWT              |
| AUTH-02 | Login com senha errada             | POST   | /api/auth/login   | {"username":"admin","password":"errada"} | 401 Unauthorized                |
| AUTH-03 | Login com usuario inexistente      | POST   | /api/auth/login   | {"username":"xyz","password":"abc"}      | 401 Unauthorized                |
| AUTH-04 | Login com campos vazios            | POST   | /api/auth/login   | {"username":"","password":""}            | 400 Bad Request (validacao)     |
| AUTH-05 | Acesso a rota protegida sem token  | GET    | /api/devices      | (sem header Authorization)               | 401 Unauthorized                |
| AUTH-06 | Acesso com token valido            | GET    | /api/devices      | Authorization: Bearer <token_valido>     | 200 OK + lista de devices       |
| AUTH-07 | Acesso com token expirado          | GET    | /api/devices      | Authorization: Bearer <token_expirado>   | 401 Unauthorized                |
| AUTH-08 | Acesso com token invalido          | GET    | /api/devices      | Authorization: Bearer tokeninvalido123   | 401 Unauthorized                |
| AUTH-09 | Consultar dados do usuario logado  | GET    | /api/auth/me      | Authorization: Bearer <token_valido>     | 200 OK + username e role        |
| AUTH-10 | Registrar usuario (como admin)     | POST   | /api/auth/register| {"username":"novo","password":"senha123","fullName":"Novo User","role":"OPERATOR"} | 201 Created |
| AUTH-11 | Registrar usuario (como operador)  | POST   | /api/auth/register| (mesmo body, token de operador)          | 403 Forbidden                   |
| AUTH-12 | Registrar com username duplicado   | POST   | /api/auth/register| {"username":"admin",...}                  | 400/409 (username ja existe)    |


============================================================================
5. TESTES DE API — DISPOSITIVOS (DEVICES)
============================================================================

| ID      | Cenario                            | Metodo | Endpoint          | Entrada                                         | Resultado Esperado              |
|---------|------------------------------------|--------|-------------------|--------------------------------------------------|---------------------------------|
| DEV-01  | Listar todos os devices            | GET    | /api/devices      | (autenticado)                                    | 200 OK + array de devices       |
| DEV-02  | Buscar device por ID valido        | GET    | /api/devices/1    | (autenticado)                                    | 200 OK + dados do device        |
| DEV-03  | Buscar device com ID inexistente   | GET    | /api/devices/999  | (autenticado)                                    | 404 Not Found / 500             |
| DEV-04  | Criar device com dados validos     | POST   | /api/devices      | {"name":"Delta","serialNumber":"PLB-004-DELTA"}  | 201 Created + device criado     |
| DEV-05  | Criar device sem nome              | POST   | /api/devices      | {"name":"","serialNumber":"PLB-005"}             | 400 Bad Request                 |
| DEV-06  | Criar device com serial duplicado  | POST   | /api/devices      | {"name":"Dup","serialNumber":"PLB-001-ALPHA"}    | 400/409 (serial ja existe)      |
| DEV-07  | Atualizar device existente         | PUT    | /api/devices/1    | {"name":"Alpha Atualizado","serialNumber":"PLB-001-ALPHA"} | 200 OK + dados atualizados |
| DEV-08  | Desativar (soft delete) device     | DELETE | /api/devices/1    | (autenticado)                                    | 204 No Content                  |
| DEV-09  | Device desativado nao aparece      | GET    | /api/devices      | (apos DEV-08)                                    | 200 OK + lista sem o device 1   |


============================================================================
6. TESTES DE API — ALERTAS (ALERTS)
============================================================================

| ID      | Cenario                            | Metodo | Endpoint                    | Entrada                                                           | Resultado Esperado              |
|---------|------------------------------------|--------|-----------------------------|-------------------------------------------------------------------|---------------------------------|
| ALT-01  | Listar todos os alertas            | GET    | /api/alerts                 | (autenticado)                                                     | 200 OK + array de alertas       |
| ALT-02  | Listar alertas ativos              | GET    | /api/alerts?status=active   | (autenticado)                                                     | 200 OK + apenas status ACTIVE   |
| ALT-03  | Buscar alerta por ID               | GET    | /api/alerts/1               | (autenticado)                                                     | 200 OK + dados do alerta        |
| ALT-04  | Buscar alertas por device          | GET    | /api/alerts/device/1        | (autenticado)                                                     | 200 OK + alertas do device 1    |
| ALT-05  | Criar alerta manualmente           | POST   | /api/alerts                 | {"deviceId":1,"type":"MANUAL","riskLevel":"HIGH","description":"Teste"} | 201 Created + alerta criado |
| ALT-06  | Criar alerta sem device ID         | POST   | /api/alerts                 | {"type":"MANUAL","riskLevel":"HIGH"}                              | 400 Bad Request                 |
| ALT-07  | Acknowledge alerta ativo           | PATCH  | /api/alerts/1/acknowledge   | (autenticado)                                                     | 200 OK + status ACKNOWLEDGED    |
| ALT-08  | Resolver alerta                    | PATCH  | /api/alerts/1/resolve       | (autenticado)                                                     | 200 OK + status RESOLVED        |
| ALT-09  | Contar alertas ativos              | GET    | /api/alerts/count/active    | (autenticado)                                                     | 200 OK + {"activeAlerts": N}    |
| ALT-10  | Device muda para EMERGENCY ao criar alerta | POST | /api/alerts          | {"deviceId":1,"type":"SOS_BUTTON","riskLevel":"CRITICAL"}         | Device.status = EMERGENCY       |


============================================================================
7. TESTES DE API — LEITURAS DE SENSORES (SENSOR READINGS)
============================================================================

| ID      | Cenario                                   | Metodo | Endpoint               | Entrada                                                              | Resultado Esperado                    |
|---------|-------------------------------------------|--------|------------------------|----------------------------------------------------------------------|---------------------------------------|
| SNS-01  | Enviar leitura normal (sem risco)         | POST   | /api/sensors/readings  | {"deviceId":1,"smokeDetected":false,"impactDetected":false,"temperatureCelsius":25.0,"batteryLevel":80} | 201 Created, nenhum alerta gerado |
| SNS-02  | Enviar leitura com fumaca detectada       | POST   | /api/sensors/readings  | {"deviceId":1,"smokeDetected":true,...}                              | 201 Created + alerta FIRE/CRITICAL    |
| SNS-03  | Enviar leitura com impacto detectado      | POST   | /api/sensors/readings  | {"deviceId":2,"impactDetected":true,...}                             | 201 Created + alerta IMPACT/HIGH      |
| SNS-04  | Enviar leitura com temperatura > 60C      | POST   | /api/sensors/readings  | {"deviceId":1,"temperatureCelsius":75.0,...}                         | 201 Created + alerta HIGH_TEMP/HIGH   |
| SNS-05  | Enviar leitura com bateria <= 10%         | POST   | /api/sensors/readings  | {"deviceId":1,"batteryLevel":5,...}                                  | 201 Created + alerta LOW_BATTERY/MED  |
| SNS-06  | Enviar leitura com multiplos riscos       | POST   | /api/sensors/readings  | {"deviceId":1,"smokeDetected":true,"temperatureCelsius":80.0,...}    | 201 Created + 2 alertas criados       |
| SNS-07  | Listar ultimas leituras por device        | GET    | /api/sensors/readings?deviceId=1 | (autenticado)                                              | 200 OK + array ordenado por timestamp |
| SNS-08  | Listar ultimas leituras (todas)           | GET    | /api/sensors/readings/latest     | (autenticado)                                              | 200 OK + 1 leitura por device         |
| SNS-09  | Leitura atualiza heartbeat do device      | POST   | /api/sensors/readings  | {"deviceId":1,"latitude":-23.99,"longitude":-46.30,"batteryLevel":75,"satelliteConnected":true} | Device.lastSeen atualizado |
| SNS-10  | Leitura sem deviceId                      | POST   | /api/sensors/readings  | {"smokeDetected":false,...}                                          | 400 Bad Request                       |


============================================================================
8. TESTES DE INTEGRACAO — FLUXO COMPLETO
============================================================================

| ID      | Cenario                                    | Passos                                                                                          | Resultado Esperado                                      |
|---------|--------------------------------------------|-------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| INT-01  | Fluxo de login ate dashboard               | 1. POST /auth/login → 2. GET /devices → 3. GET /alerts                                         | Login ok, devices listados, alertas listados            |
| INT-02  | Simulacao IoT completa                     | 1. Python envia leitura com fumaca → 2. Backend cria alerta FIRE → 3. GET /alerts retorna novo  | Alerta FIRE visivel no sistema                          |
| INT-03  | SOS manual end-to-end                      | 1. POST /alerts (SOS_BUTTON) → 2. PATCH acknowledge → 3. PATCH resolve                          | Alerta criado, reconhecido e resolvido                  |
| INT-04  | Ciclo completo de device                   | 1. POST /devices → 2. POST /sensors/readings → 3. GET /devices (lastSeen atualizado)            | Device criado, heartbeat atualizado                     |
| INT-05  | Registro de usuario e login                | 1. POST /auth/register (como admin) → 2. POST /auth/login (com novo usuario)                    | Novo usuario consegue fazer login                       |
| INT-06  | Leitura IoT publica (sem autenticacao)     | 1. POST /sensors/readings (sem token)                                                            | 201 Created (endpoint publico para IoT)                 |
| INT-07  | Tentativa de acesso apos logout            | 1. Login → 2. Usar token → 3. Token expira/invalido → 4. GET /devices                           | 401 Unauthorized                                        |


============================================================================
9. TESTES DO FRONTEND MOBILE (React Native / Expo)
============================================================================

| ID      | Cenario                                    | Acao do Operador                                          | Resultado Esperado                                      |
|---------|--------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------|
| MOB-01  | Tela de login aparece sem autenticacao     | Abrir o app sem login salvo                               | LoginScreen exibida com campos usuario e senha          |
| MOB-02  | Login com credenciais validas              | Digitar admin/admin123 e pressionar "Entrar"              | Redirecionado para Dashboard                            |
| MOB-03  | Login com credenciais invalidas            | Digitar admin/senhaerrada e pressionar "Entrar"           | Mensagem de erro: "Usuario ou senha invalidos"          |
| MOB-04  | Dashboard carrega dispositivos             | Navegar para aba Dashboard                                | Lista de beacons com status, bateria e ultimo sinal     |
| MOB-05  | Emergencias mostra alertas ativos          | Navegar para aba Emergencias                              | Lista de alertas com cores por nivel de risco           |
| MOB-06  | Acknowledge alerta                         | Clicar em alerta ativo e pressionar "Reconhecer"          | Status muda para ACKNOWLEDGED                           |
| MOB-07  | Resolver alerta                            | Clicar em alerta reconhecido e pressionar "Resolver"      | Status muda para RESOLVED                               |
| MOB-08  | Mapa exibe marcadores dos devices          | Navegar para aba Mapa                                     | Mapa com pins nos locais dos beacons                    |
| MOB-09  | Cadastrar beacon via Configuracoes         | Preencher formulario e pressionar "Registrar Beacon"      | Device criado, mensagem de sucesso                      |
| MOB-10  | Enviar SOS manual                          | Preencher ID do device e pressionar "Enviar SOS"          | Alerta SOS_BUTTON criado, mensagem de confirmacao       |
| MOB-11  | Informacoes do sistema                     | Navegar para Configuracoes, secao "Informacoes"           | URLs da API e versao exibidos corretamente              |
| MOB-12  | Mostrar/ocultar senha na tela de login     | Clicar no icone de olho no campo de senha                 | Senha alterna entre visivel e oculta                    |


============================================================================
10. TESTES DO SIMULADOR IoT (Python)
============================================================================

| ID      | Cenario                                    | Comando                                   | Resultado Esperado                                      |
|---------|--------------------------------------------|-------------------------------------------|---------------------------------------------------------|
| SIM-01  | Enviar leitura normal                      | python simulate.py --scenario normal      | Heartbeat enviado, device atualizado                    |
| SIM-02  | Simular incendio                           | python simulate.py --scenario fire        | Leitura com fumaca, alerta FIRE criado automaticamente  |
| SIM-03  | Simular impacto                            | python simulate.py --scenario impact      | Leitura com impacto, alerta IMPACT criado               |
| SIM-04  | Simular SOS                               | python simulate.py --scenario sos         | Alerta SOS_BUTTON criado diretamente                    |
| SIM-05  | Enviar para device especifico              | python simulate.py --scenario fire --device 2 | Alerta FIRE criado para device 2                    |
| SIM-06  | Modo loop continuo                         | python simulate.py --loop 5               | Leituras enviadas a cada 5 segundos                     |
| SIM-07  | Menu interativo                            | python simulate.py                        | Menu exibido com todas as opcoes                        |
| SIM-08  | Backend offline                            | python simulate.py (sem backend rodando)  | Mensagem de erro de conexao exibida                     |


============================================================================
11. TESTES DO BANCO DE DADOS (SQL)
============================================================================

| ID      | Cenario                                    | Acao                                              | Resultado Esperado                                      |
|---------|--------------------------------------------|---------------------------------------------------|---------------------------------------------------------|
| SQL-01  | Executar script de criacao                 | Rodar database/create_database.sql no PostgreSQL  | 4 tabelas criadas sem erros                             |
| SQL-02  | Dados iniciais inseridos                   | Verificar tabelas users e devices                 | 2 usuarios + 3 devices inseridos                        |
| SQL-03  | Constraint de username unico               | INSERT usuario com username duplicado             | Erro de constraint violada                              |
| SQL-04  | Constraint de serial_number unico          | INSERT device com serial duplicado                | Erro de constraint violada                              |
| SQL-05  | Foreign key de sensor_readings             | INSERT reading com device_id inexistente          | Erro de FK violada                                      |
| SQL-06  | Foreign key de alerts                      | INSERT alert com device_id inexistente            | Erro de FK violada                                      |
| SQL-07  | Check constraint de role                   | INSERT user com role = 'INVALIDO'                 | Erro de check constraint                                |
| SQL-08  | Check constraint de status do device       | INSERT device com status = 'INVALIDO'             | Erro de check constraint                                |
| SQL-09  | Cascade delete                             | DELETE device que tem readings e alerts           | Device, readings e alerts deletados                     |
| SQL-10  | Indices funcionais                         | EXPLAIN ANALYZE em queries com filtro             | Indices utilizados, plano otimizado                     |


============================================================================
12. CRITERIOS DE ACEITACAO
============================================================================

Para o sistema ser considerado aprovado, TODOS os seguintes criterios devem ser atendidos:

1. Todos os testes de autenticacao (AUTH-01 a AUTH-12) devem passar.
2. Todos os testes de CRUD de devices (DEV-01 a DEV-09) devem passar.
3. Todos os testes de alertas (ALT-01 a ALT-10) devem passar.
4. Todos os testes de leituras (SNS-01 a SNS-10) devem passar.
5. Os fluxos de integracao (INT-01 a INT-07) devem funcionar corretamente.
6. O app mobile deve funcionar conforme testes MOB-01 a MOB-12.
7. O simulador IoT deve funcionar conforme testes SIM-01 a SIM-08.
8. O script SQL deve executar sem erros conforme testes SQL-01 a SQL-10.

Total de cenarios de teste: 68
