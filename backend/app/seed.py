import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.db import get_session_factory
from app.models import Usuario
from app.security import hash_password


async def seed_users() -> None:
    settings = get_settings()
    users = (
        (
            "Administrador de Sistemas",
            str(settings.admin_email).lower(),
            "ADMIN",
            settings.admin_password.get_secret_value(),
        ),
        (
            "Operador COE Esmeraldas",
            str(settings.coe_email).lower(),
            "OPERADOR_COE",
            settings.coe_password.get_secret_value(),
        ),
    )

    async with get_session_factory()() as session:
        for name, email, role, password in users:
            email_owner = await session.scalar(select(Usuario).where(Usuario.email == email))
            if email_owner is not None and email_owner.rol != role:
                raise ValueError(f"El correo configurado para {role} ya está asignado a otro perfil.")
            user = email_owner
            if user is None:
                role_users = (
                    await session.scalars(
                        select(Usuario).where(Usuario.rol == role).with_for_update()
                    )
                ).all()
                if len(role_users) > 1:
                    raise ValueError(
                        f"Hay varias cuentas {role}; define cuál debe conservarse antes de ejecutar el seed."
                    )
                user = role_users[0] if role_users else None
            if user is None:
                user = Usuario(nombre=name, email=email, rol=role)
                session.add(user)
            user.nombre = name
            user.email = email
            user.password_hash = hash_password(password)
            user.activo = True
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed_users())
