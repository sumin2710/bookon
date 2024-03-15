# bookon

## erd

- https://drawsql.app/teams/sus-team-1/diagrams/bookon

## api

- swagger :

## Q/A

- 사실 그냥 redis 만 사용해도 동시성 처리를 할 수 있습니다. 이유가 뭘까요?
- 한 리소스를 나타내는 키를 SETNX로 redis에 넣고 만약 다른 클라언트가 해당 리소스에 접근하려고 하면 키로 검색한 후에 존재하면 에러 메시지를 반환하는 식으로 동시성 처리를 할 수 있을 것 같습니다. 에러 메세지보단 대기하게 만드는 게 더 좋을텐데... 메시징큐처럼 사용해보시란 말씀은 그, PUB SUB 사용해서 해보란 말씀이시죠??

- 트랜잭션 자체도(queryRunner.commitTransaction(); 등) 동시성 처리, race condition을 해결할 수 있답니다. 그 이유는 뭘까요?
- 트랜잭션도 DB의 데이터에 동시에 접근하는걸 차단하니까 동시성 처리를 할 수 있을 것 같습니다.
