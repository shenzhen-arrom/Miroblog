import { microblg_backend } from "../../declarations/microblg_backend";

import {Principal} from "@dfinity/principal";

// 发送消息
async function post() { 
  let post_button = document.getElementById("post");
  let error = document.getElementById("error");
  error.innerText = "";
  post_button.disable = true;
  let textarea = document.getElementById("message");
  let opt = document.getElementById("opt").value;
  try{
    await microblg_backend.post(opt, textarea.value);
    textarea.value = "";
  }catch(err){
    console.log(err);
    error.innerText = "Post Failed!";
  }
  post_button.disable = false;
  load_posts("0");
}

// 设置作者昵称
async function set_name() { 
  let set_button = document.getElementById("btn_set");
  let error = document.getElementById("set_error");
  error.innerText = "";
  set_button.disable = true;
  let textarea = document.getElementById("set");
  let opt = document.getElementById("opt").value;
  try{
    await microblg_backend.set_name(opt, textarea.value);
  }catch(err){
    console.log(err);
    error.innerText = "Set Failed!";
  }
  set_button.disable = false;
  error.innerText = "Success!";
}

// 关注微博
async function follow() { 
  let follow_button = document.getElementById("btn_follow");
  let error = document.getElementById("follow_error");
  error.innerText = "";
  follow_button.disable = true;
  let textarea = document.getElementById("follow");
  try{
    await microblg_backend.follow(Principal.fromText(textarea.value));
  }catch(err){
    console.log(err);
    error.innerText = "Set Failed!";
  }
  follow_button.disable = false;
  reflesh_author_list();
}

// 刷新作者列表
async function reflesh_author_list(){
  let followed = await microblg_backend.follows();
  let followed_ul = document.getElementById("author_list");
  console.log(followed);
  followed_ul.replaceChildren([]);
  // 添加自己
  let myself = document.createElement("input");
  myself.type = "radio";
  myself.name = "authorList";
  myself.id = "myself";
  myself.value = "0";
  myself.checked = true;
  followed_ul.appendChild(myself);
  let lab_myself = document.createElement("label");
  lab_myself.innerText = "My message";
  lab_myself.setAttribute("for", "myself");
  followed_ul.appendChild(lab_myself);
  followed_ul.appendChild(document.createElement("br"));
  // 添加所有关注的人
  let all_author = document.createElement("input");
  all_author.type = "radio";
  all_author.name = "authorList";
  all_author.id = "all_author";
  all_author.value = "1";
  followed_ul.appendChild(all_author);
  let lab_all_author = document.createElement("label");
  lab_all_author.innerText = "Authors I follow";
  lab_all_author.setAttribute("for", "all_author");
  followed_ul.appendChild(lab_all_author);
  followed_ul.appendChild(document.createElement("br"));
  // 添加关注的人
  followed.forEach(function(item){
    let author = document.createElement("input");
    author.type = "radio";
    author.name = "authorList";
    author.id = "author";
    author.value = item[0].toText();
    followed_ul.appendChild(author);
    let lab_author = document.createElement("label");
    lab_author.innerText = item[1];
    lab_author.setAttribute("for", "author");
    followed_ul.appendChild(lab_author);
    followed_ul.appendChild(document.createElement("br"));
  });
}

// 重新载入消息列表
async function load_posts(author) {
  let posts_section = document.getElementById("posts");
  var posts;
  if (author == undefined) author = "0";
  console.log("load_posts: " + author);
  switch(author) {
    case "0":
      posts = await microblg_backend.posts(1000);
      break;
    case "1":
      posts = await microblg_backend.timeline([], 1000);
      break;
    default:
      posts = await microblg_backend.timeline([Principal.fromText(author)], 1000);
  }
  console.log(posts);
  posts_section.replaceChildren([]);
  for (var i = 0; i< posts.length; i++) { 
    let post = document.createElement("p");
    post.innerText = "[" + new Date(Number(posts[i].time/1000000n)).toLocaleString() + "] <" + posts[i].author + "> " + posts[i].text;
    posts_section.appendChild(post)
  }
}

function load() { 
  let post_button = document.getElementById("post");
  post_button.onclick = post;
  let set_button = document.getElementById("btn_set");
  set_button.onclick = set_name;
  let follow_button = document.getElementById("btn_follow");
  follow_button.onclick = follow;

  let followed_ul = document.getElementById("author_list");
  followed_ul.onclick = function (event) {
    console.log(event);
    const {target} = event;
    console.log("target:" + target.value);
    if (target.tagName.toLowerCase() !== "input") return;
    load_posts(target.value);
  };
  load_posts();
  reflesh_author_list();
  // setInterval(load_posts, 3000);
}

window.onload = load;