class Comment {
  constructor(name, comment, time) {
    this.name = name;
    this.comment = comment;
    this.time = time;
  }
  toHTML() {
    return `<tr>
        <td>${this.name}</td>
        <td>${this.comment}</td>
        <td>${this.time.toLocaleString()}</td>
     </tr>
    `;
  }
}

class Comments {
  constructor() {
    this.comments = [];
  }
  addComment(comment) {
    this.comments.unshift(comment);
  }
  toHTML() {
    return this.comments.map(comment => comment.toHTML()).join('');
  }
  static load(commentList) {
    const comments = new Comments();
    commentList.forEach(c => {
      comments.addComment(new Comment(c.name, c.comment, new Date(c.time)));
    });
    return comments;
  }
  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { Comment, Comments };
