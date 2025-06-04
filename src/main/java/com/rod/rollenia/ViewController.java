package com.rod.rollenia;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    @GetMapping("/")
    public String defaultHome() {
        return "home";
    }
    @GetMapping("/home")
    public String home() {
        return "home";
    }

    @GetMapping("/noticias")
    public String noticias() {
        return "noticias";
    }
    @GetMapping("/login")
    public String login() {
        return "login_register";
    }
    @GetMapping("/detalles_noticias")
    public String det_noticias() {
        return "detalles_noticias";
    }

    @GetMapping("/detalles_noticias/{id}")
    public String det_noticias_con_id(@PathVariable Long id, org.springframework.ui.Model model) {
        model.addAttribute("noticiaId", id);
        return "detalles_noticias";
    }

    @GetMapping("/foro")
    public String topics() {
        return "foro";
    }

    @GetMapping("/foro_detail")
    public String topicDetails() {
        return "foro_detail";
    }

    @GetMapping("/partidas")
    public String games() {
        return "partidas";
    }

    @GetMapping("/partida_detail")
    public String gameDetails() {
        return "detalles_partida";
    }

    @GetMapping("/perfil_user")
    public String profile() {
        return "perfil_user";
    }

    @GetMapping("/create-topic")
    public String createTopicForm() {
        return "create-topic";
    }

    @GetMapping("/crear_partida")
    public String createGameForm() {
        return "new_partida";
    }

    @GetMapping("/libreria")
    public String libreria() {
        return "libreria";
    }

    @GetMapping("/sistema_detail")
    public String sistemaDetail() {
        return "sistema_detail";
    }
}

