import List "mo:base/List";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor {
  stable var name : Text = "Arrom";
  public type Message = {
    author : Text;
    text : Text;
    time : Time.Time;
  };
  stable var followed : List.List<(Principal, Text)> = List.nil();
  stable var messages : List.List<Message> = List.nil();

  public type Microblog = actor {
    follow : shared (Principal) -> async ();
    //添加关注对象
    follows : shared query () -> async [Principal];
    //返回关注列表
    post : shared (Text, Text) -> async ();
    //发布消息
    posts : shared query (Time.Time) -> async [Message];
    //获取发布的消息
    timeline : shared ([Principal], Time.Time) -> async [Message];
    //获取所有关注的人发布的消息
    set_name : shared (Text, Text) -> async ();
    // 设置作者名称
    get_name : shared query () -> async ?Text;
    // 获取作者名称
  };

  public shared func set_name(opt : Text, uname : Text) : async () {
    assert (opt == "12345");
    name := uname;
  };

  public shared query func get_name() : async ?Text {
    ?name;
  };

  public shared func follow(id : Principal) : async () {
    let canister : Microblog = actor (Principal.toText(id));
    let uname : Text = switch (await canister.get_name()) {
      case null "No name";
      case (?Text) Text;
    };
    followed := List.push((id, uname), followed);
  };

  public shared query func follows() : async [(Principal, Text)] {
    List.toArray(followed);
  };

  public shared (msg) func post(opt : Text, text : Text) : async (Time.Time) {
    assert (opt == "12345");
    let now = Time.now();
    let postMsg = {
      author = name;
      text = text;
      time = now;
    };
    messages := List.push(postMsg, messages);
    now;
  };

  public shared query func posts(since : Time.Time) : async [Message] {
    let sinceList = List.filter(
      messages,
      func(msg : Message) : Bool {
        msg.time > since;
      },
    );
    List.toArray(sinceList);
  };

  public shared func timeline(author : [Principal], since : Time.Time) : async [Message] {
    // 消息列表
    var all : List.List<Message> = List.nil();
    // 要获取的作者列表
    var authorList : List.List<Principal> = List.nil();

    let getId = func((id : Principal, name : Text)) : Principal {
      id;
    };

    // 获取选择的作者，all为所有人
    if (author.size() == 0) {
      authorList := List.map(followed, getId);
    } else {
      authorList := List.fromArray(author);
    };

    // 根据作者获取消息
    for (id in Iter.fromList(authorList)) {
      let canister : Microblog = actor (Principal.toText(id));
      let msgs = await canister.posts(since);
      for (msg in Iter.fromArray(msgs)) {
        all := List.push(msg, all);
      };
    };

    List.toArray(all);
  };

}

