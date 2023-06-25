from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("all-posts", views.all_posts, name="all_posts"),
    path('create-post', views.create_post, name='create_post'),
    path("profile/<str:username>", views.profile, name="profile"),
    path('follow/<str:username>', views.follow_user, name='follow_user'),
    path('unfollow/<str:username>', views.unfollow_user, name='unfollow_user'),
    path("following", views.following, name="following"),
    path('posts/<int:post_id>', views.update_post, name='update_post'),
    path('posts/<int:post_id>/like', views.like_post, name='like_post'),
    path('posts/<int:post_id>/unlike', views.unlike_post, name='unlike_post')
]