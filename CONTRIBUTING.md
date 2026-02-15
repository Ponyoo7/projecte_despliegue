# Guia de Contribució

Gràcies per considerar contribuir a aquest projecte! Valoramos molt la vostra ajuda per millorar l'aplicació.

## Com col·laborar

### Reportar Errors (Issues)
Si trobeu un error o teniu una idea per a una nova funcionalitat:
1. Reviseu si l'[Issue](https://github.com/vostre-usuari/vostre-repositori/issues) ja existeix.
2. Si no, obriu-ne un de nou explicant detalladament el problema o la proposta.

### Enviar Canvis (Pull Requests)
1. Feu un **Fork** del repositori.
2. Creeu una nova branca per a la vostra funcionalitat o correcció:
   ```bash
   git checkout -b feature/nova-funcionalitat
   ```
3. Feu els vostres canvis i *commits*.
4. Assegureu-vos que els tests passen:
   ```bash
   npm test
   ```
5. Feu *Push* a la vostra branca:
   ```bash
   git push origin feature/nova-funcionalitat
   ```
6. Obriu un **Pull Request** apuntant a la branca `main` d'aquest repositori.

### Estil de Codi
- Mantingueu l'estil de codi consistent amb la resta del projecte.
- Utilitzeu ES Modules (`import`/`export`).
- Comenteu el codi quan sigui necessari.
