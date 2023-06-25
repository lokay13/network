document.addEventListener('DOMContentLoaded', function() {  
    const followButton = document.querySelector('#follow-button');
    const unfollowButton = document.querySelector('#unfollow-button');
    const editButton = document.querySelector('#edit-button');
    const saveButton = document.querySelector('#save-button');
    const likeButton = document.querySelector('#like-button');
    const unlikeButton = document.querySelector('#unlike-button');

    if (followButton) {
        followButton.addEventListener('click', followUser);
    }

    if (unfollowButton) {
        unfollowButton.addEventListener('click', unfollowUser);
    }

    if (editButton) {
        editButton.addEventListener('click', editPost);
    }

    if (saveButton) {
        saveButton.addEventListener('click', savePost);
    }

    if (likeButton) {
        likeButton.addEventListener('click', likePost);
    }

    if (unlikeButton) {
        unlikeButton.addEventListener('click', unlikePost);
    }
});

function followUser() {
    const username = document.querySelector('#username').textContent;
    fetch(`/follow/${username}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // Update the button to "Unfollow"
            const followButton = document.querySelector('#follow-button');
            const unfollowButton = document.createElement('button');
            unfollowButton.id = 'unfollow-button';
            unfollowButton.className = 'btn btn-danger';
            unfollowButton.textContent = 'Unfollow';

            followButton.parentNode.replaceChild(unfollowButton, followButton);

            // Attach event listener to the new button
            unfollowButton.addEventListener('click', unfollowUser);
        }
    });
}

function unfollowUser() {
    const username = document.querySelector('#username').textContent;
    fetch(`/unfollow/${username}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // Update the button to "Follow"
            const unfollowButton = document.querySelector('#unfollow-button');
            const followButton = document.createElement('button');
            followButton.id = 'follow-button';
            followButton.className = 'btn btn-primary';
            followButton.textContent = 'Follow';

            unfollowButton.parentNode.replaceChild(followButton, unfollowButton);

            // Attach event listener to the new button
            followButton.addEventListener('click', followUser);
        }
    });
}

function editPost(event) {
    const postCard = event.target.closest('.card');
    const textElement = postCard.querySelector('.card-text');
    const currentText = textElement.textContent.trim();

    // Replace the post content with a textarea for editing
    textElement.innerHTML = `
        <textarea class="form-control">${currentText}</textarea>
    `;

    // Hide the Edit button and show the Save button
    const editButton = postCard.querySelector('#edit-button');
    const saveButton = postCard.querySelector('#save-button');
    editButton.style.display = 'none';
    saveButton.style.display = 'block';

    saveButton.addEventListener('click', savePost);
}

function savePost(event) {
    const postCard = event.target.closest('.card');
    const textArea = postCard.querySelector('textarea');
    const newText = textArea.value.trim();
    const postId = postCard.dataset.postId;

    // Send a PATCH request to update the post content
    fetch(`/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            text: newText
        })
    })
    .then(response => response.json())
    .then(data => {
        // Update the post content in the DOM
        const textElement = postCard.querySelector('.card-text');
        textElement.textContent = data.text;

        // Show the Edit button and hide the Save button
        const editButton = postCard.querySelector('#edit-button');
        const saveButton = postCard.querySelector('#save-button');
        editButton.style.display = 'block';
        saveButton.style.display = 'none';

        editButton.addEventListener('click', editPost);
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
