from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json

from .models import User, Post


def index(request):
    return redirect('all_posts')


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

@csrf_exempt
@login_required
def create_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    text = data.get("text", "")

    if not text:
        return JsonResponse({"error": "Text field cannot be empty."}, status=400)

    # Create the post
    post = Post(author=request.user, text=text)
    post.save()

    # Prepare the data to send back to the client
    response_data = {
        "postId": post.id,
        "author": post.author.username,
        "text": post.text,
        "timestamp": post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        "likes": post.likes
    }

    return JsonResponse(response_data, status=201)


def all_posts(request):
    posts = Post.objects.order_by('-timestamp').all()
    paginator = Paginator(posts, 10)  # Display 10 posts per page

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    formatted_posts = []
    for post in page_obj:
        formatted_posts.append({
            'postId': post.id,
            'author': post.author.username,
            'text': post.text,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'likes': post.likes
        })

    context = {
        'posts': formatted_posts,
        'page_obj': page_obj,
    }
    return render(request, 'network/index.html', context)


def profile(request, username):
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(author=user).order_by('-timestamp')
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    formatted_posts = []
    for post in page_obj:
        formatted_posts.append({
            'postId': post.id,
            'author': post.author.username,
            'text': post.text,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'likes': post.likes
        })

    context = {
        'user_profile': user,
        'followers_count': user.followers.count(),
        'following_count': user.following.count(),
        'posts': formatted_posts,
        'page_obj': page_obj,
    }
    return render(request, 'network/profile.html', context)

@csrf_exempt
def update_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == 'PATCH':
        data = json.loads(request.body)
        new_text = data.get('text')

        if new_text:
            post.text = new_text
            post.save()

            likes = list(post.likes.values())
            response_data = {
                'postId': post.id,
                'author': post.author.username,
                'text': post.text,
                'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'likes': likes
            }

            return JsonResponse(response_data, status=200)
        else:
            return JsonResponse({'error': 'Text field cannot be empty.'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
@login_required
def follow_user(request, username):
    user = get_object_or_404(User, username=username)
    request.user.following.add(user)
    return HttpResponse(status=200)

@csrf_exempt
@login_required
def unfollow_user(request, username):
    user = get_object_or_404(User, username=username)
    request.user.following.remove(user)
    return HttpResponse(status=200)

@login_required
def following(request):
    user = request.user
    followed_users = user.following.all()
    posts = Post.objects.filter(author__in=followed_users).order_by('-timestamp')
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    formatted_posts = []
    for post in page_obj:
        formatted_posts.append({
            'postId': post.id,
            'author': post.author.username,
            'text': post.text,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'likes': post.likes
        })

    context = {
        'posts': formatted_posts,
        'page_obj': page_obj,
    }
    return render(request, 'network/following.html', context)

@csrf_exempt
@login_required
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == 'POST':
        # Check if the user has already liked the post
        if request.user in post.likes.all():
            return JsonResponse({'error': 'You have already liked this post.'}, status=400)

        # Add the user to the post's likes
        post.likes.add(request.user)

        # Prepare the updated number of likes to send back to the client
        response_data = {
            'postId': post.id,
            'likes': post.likes.count()
        }

        return JsonResponse(response_data, status=200)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    
@csrf_exempt
@login_required
def unlike_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if request.method == 'POST':
        # Check if the user has already liked the post
        if request.user not in post.likes.all():
            return JsonResponse({'error': 'You have not liked this post.'}, status=400)

        # Remove the user from the post's likes
        post.likes.remove(request.user)

        # Prepare the updated number of likes to send back to the client
        response_data = {
            'postId': post.id,
            'likes': post.likes.count()
        }

        return JsonResponse(response_data, status=200)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)