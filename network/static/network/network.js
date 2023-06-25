document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#post-button').addEventListener('click', createPost);

    const likeButton = document.querySelector('#like-button');
    const unlikeButton = document.querySelector('#unlike-button');

    if (likeButton) {
        likeButton.addEventListener('click', likePost);
    }

    if (unlikeButton) {
        unlikeButton.addEventListener('click', unlikePost);
    }
});

function createPost() {
    const text = document.querySelector('#post-text').value;
    fetch('/create-post', {
        method: 'POST',
        body: JSON.stringify({
            text: text
        })
    })
    .then(response => response.json())
    .then(data => {
        // Clear the text field
        document.querySelector('#post-text').value = '';

        // Add the new post to the DOM
        const allPostsDiv = document.querySelector('#all-posts');
        const newPostDiv = document.createElement('div');
        newPostDiv.classList.add('card', 'mb-3');
        newPostDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title"><a href="/profile/${data.author}">${data.author}</a></h5>
                <p class="card-text">${data.text}</p>
                <p class="card-text">
                    <small class="text-muted">${data.timestamp}</small>
                </p>
                <p class="card-text">${data.likes}</p>
            </div>
        `;
        allPostsDiv.insertBefore(newPostDiv, allPostsDiv.firstChild);
    });
}

function likePost(event) {
    const postCard = event.target.closest('.card');
    const postId = postCard.dataset.postId;
  
    // Send a POST request to like the post
    fetch(`/posts/${postId}/like`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        // Update the number of likes in the DOM
        const likesElement = postCard.querySelector('.card-likes');
        likesElement.textContent = data.likes;
  
        // Hide the Like button and show the Unlike button
        const likeButton = postCard.querySelector('#like-button');
        const unlikeButton = postCard.querySelector('#unlike-button');
        
        if (likeButton) {
          likeButton.style.display = 'none';
        }
        
        if (unlikeButton) {
          unlikeButton.style.display = 'inline-block';
          unlikeButton.addEventListener('click', unlikePost);
        } else {
          const newUnlikeButton = document.createElement('button');
          newUnlikeButton.id = 'unlike-button';
          newUnlikeButton.classList.add('btn', 'btn-link', 'unlike-button');
          newUnlikeButton.innerHTML = '<i class="bi bi-heart-fill"></i>';
          newUnlikeButton.addEventListener('click', unlikePost);
          postCard.querySelector('.card-like').prepend(newUnlikeButton);
        }
      });
  }
  
  function unlikePost(event) {
    const postCard = event.target.closest('.card');
    const postId = postCard.dataset.postId;
  
    // Send a POST request to unlike the post
    fetch(`/posts/${postId}/unlike`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        // Update the number of likes in the DOM
        const likesElement = postCard.querySelector('.card-likes');
        likesElement.textContent = data.likes;
  
        // Hide the Unlike button and show the Like button
        const likeButton = postCard.querySelector('#like-button');
        const unlikeButton = postCard.querySelector('#unlike-button');
        
        if (unlikeButton) {
          unlikeButton.style.display = 'none';
          unlikeButton.removeEventListener('click', unlikePost);
        }
        
        if (likeButton) {
          likeButton.style.display = 'inline-block';
          likeButton.addEventListener('click', likePost);
        } else {
          const newLikeButton = document.createElement('button');
          newLikeButton.id = 'like-button';
          newLikeButton.classList.add('btn', 'btn-link', 'like-button');
          newLikeButton.innerHTML = '<i class="bi bi-heart"></i>';
          newLikeButton.addEventListener('click', likePost);
          postCard.querySelector('.card-like').prepend(newLikeButton);
        }
      });
  }