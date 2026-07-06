package cc.genlab.genlablaunchpadlmsapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(excludeName = { "org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration" })
@EnableScheduling
public class GenlabLaunchpadLmsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GenlabLaunchpadLmsApiApplication.class, args);
    }

}
