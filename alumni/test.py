from main import get_contacts_list

def test_get_contacts():
    contacts = get_contacts_list(query="software engineer", limit=5)
    
    print(contacts)
    
def main():
    test_get_contacts()
    
if __name__ == "__main__":
    main()