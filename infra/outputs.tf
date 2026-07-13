output "instance_id" {
  value = aws_instance.star_rating_server.id
}

output "public_ip" {
  value = aws_instance.star_rating_server.public_ip
}

output "public_dns" {
  value = aws_instance.star_rating_server.public_dns
}
